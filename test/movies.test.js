import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import net from "node:net";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ quiet: true });

test("Movie CRUD API with MySQL", { timeout: 30000 }, async (t) => {
  const database = `movie_node_test_${randomUUID().replaceAll("-", "")}`;
  const admin = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });
  let child;
  let port;
  let created;
  const movie = {
    name: "Test movie 🎬 O'Brien",
    poster: "https://example.com/poster.jpg",
    rating: "8.4",
    summary: "A story; DROP TABLE movies; --",
    trailer: "https://www.youtube.com/embed/OKBMCL-frPU",
  };

  async function start() {
    let output = "";
    child = spawn(process.execPath, ["index.js"], {
      env: { ...process.env, PORT: String(port), DB_NAME: database },
      stdio: ["ignore", "pipe", "pipe"],
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Startup timed out: ${output}`)), 10000);
      child.stdout.on("data", (data) => {
        output += data;
        if (output.includes("Movie API:")) { clearTimeout(timer); resolve(); }
      });
      child.stderr.on("data", (data) => { output += data; });
      child.once("error", (error) => { clearTimeout(timer); reject(error); });
      child.once("exit", (code) => {
        clearTimeout(timer);
        reject(new Error(`Server exited (${code}): ${output}`));
      });
    });
  }

  async function stop() {
    if (!child || child.exitCode !== null || child.signalCode !== null) return;
    const exited = once(child, "exit");
    const timer = setTimeout(() => child.kill("SIGKILL"), 5000);
    child.kill("SIGTERM");
    const [code] = await exited;
    clearTimeout(timer);
    child = undefined;
    assert.equal(code, 0, "Server should shut down cleanly");
  }

  async function request(method, path = "", body, status = 200, headers = {}) {
    const res = await fetch(`http://127.0.0.1:${port}/api/movies${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const text = await res.text();
    assert.equal(res.status, status, `${method} ${path}: ${text}`);
    return { data: text ? JSON.parse(text) : undefined, headers: res.headers };
  }

  try {
    const sql = (await readFile(new URL("../database.sql", import.meta.url), "utf8"))
      .replaceAll("synechron_movies_node", database);
    await admin.query(sql);
    const listener = net.createServer().listen(0, "127.0.0.1");
    await once(listener, "listening");
    port = listener.address().port;
    await new Promise((resolve) => listener.close(resolve));
    await start();

    await t.test("SQL schema and seed provide the 11 sample movies", async () => {
      const { data } = await request("GET");
      assert.equal(data.length, 11);
      assert.deepEqual(data.map((row) => row.id), Array.from({ length: 11 }, (_, i) => String(109 - i)));
      assert.equal((await request("GET", "/99")).data.name, "Vikram");
    });

    await t.test("rerunning the SQL seed preserves existing edits", async () => {
      await admin.query(`UPDATE ${mysql.escapeId(database)}.movies SET name = 'Edited Vikram' WHERE id = 99`);
      await admin.query(sql);
      assert.equal((await request("GET", "/99")).data.name, "Edited Vikram");
      assert.equal((await request("GET")).data.length, 11);
    });

    await t.test("create accepts React form strings and safely stores SQL-looking text", async () => {
      created = (await request("POST", "", movie, 201)).data;
      assert.match(created.id, /^[1-9]\d*$/);
      assert.ok(Number(created.id) > 109);
      assert.deepEqual(created, { ...movie, id: created.id, rating: 8.4 });
      assert.deepEqual((await request("GET", `/${created.id}`)).data, created);
      const [rows] = await admin.execute(`SELECT name, summary FROM ${mysql.escapeId(database)}.movies WHERE id = ?`, [created.id]);
      assert.deepEqual(rows[0], { name: movie.name, summary: movie.summary });
    });

    await t.test("update and unchanged update both return the movie", async () => {
      const updated = { ...movie, name: "Updated movie", rating: 9.2 };
      created = { ...updated, id: created.id };
      assert.deepEqual((await request("PUT", `/${created.id}`, updated)).data, created);
      assert.deepEqual((await request("PUT", `/${created.id}`, updated)).data, created);
    });

    await t.test("data persists across a server restart", async () => {
      await stop();
      await start();
      assert.deepEqual((await request("GET", `/${created.id}`)).data, created);
    });

    await t.test("browser requests and PUT preflight receive CORS headers", async () => {
      const headers = { Origin: "http://localhost:5173" };
      assert.equal((await request("GET", "", undefined, 200, headers)).headers.get("access-control-allow-origin"), "*");
      const preflight = await request("OPTIONS", `/${created.id}`, undefined, 204, {
        ...headers, "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "content-type",
      });
      assert.match(preflight.headers.get("access-control-allow-methods"), /PUT/);
    });

    await t.test("basic validation rejects missing fields and invalid ratings", async () => {
      for (const body of [null, {}, [], { ...movie, name: " " }, { ...movie, name: "x".repeat(256) }, { ...movie, poster: null }, { ...movie, summary: 2 }, { ...movie, trailer: 3 }]) {
        await request("POST", "", body, 400);
      }
      for (const rating of ["", " ", null, true, [], {}, "NaN", "Infinity", -1, 10.1]) {
        await request("POST", "", { ...movie, rating }, 400);
      }
      await request("PUT", `/${created.id}`, { ...movie, rating: -1 }, 400);
    });

    await t.test("optional trailer and ratings at 0 and 10 are accepted", async () => {
      for (const rating of ["0", 10]) {
        const { trailer, ...body } = { ...movie, rating };
        const added = (await request("POST", "", body, 201)).data;
        assert.equal(added.trailer, "");
        assert.equal(added.rating, Number(rating));
        await request("DELETE", `/${added.id}`, undefined, 204);
      }
    });

    await t.test("invalid ids and missing movies return 400 and 404", async () => {
      for (const id of ["abc", "0", "-1", "1.5", "4294967296", "1%20OR%201=1"]) {
        await request("GET", `/${id}`, undefined, 400);
      }
      await request("GET", "/4294967295", undefined, 404);
      await request("PUT", "/4294967295", movie, 404);
      await request("DELETE", "/4294967295", undefined, 404);
      await request("GET", "/99/unknown", undefined, 404);
    });

    await t.test("malformed JSON returns a JSON error", async () => {
      const res = await fetch(`http://127.0.0.1:${port}/api/movies`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: "{invalid",
      });
      assert.equal(res.status, 400);
      assert.equal(typeof (await res.json()).message, "string");
    });

    await t.test("delete removes the row from MySQL", async () => {
      await request("DELETE", `/${created.id}`, undefined, 204);
      await request("GET", `/${created.id}`, undefined, 404);
      await request("DELETE", `/${created.id}`, undefined, 404);
      const [rows] = await admin.execute(`SELECT id FROM ${mysql.escapeId(database)}.movies WHERE id = ?`, [created.id]);
      assert.equal(rows.length, 0);
      assert.equal((await request("GET")).data.length, 11);
    });
  } finally {
    try { await stop(); }
    finally {
      await admin.query(`DROP DATABASE IF EXISTS ${mysql.escapeId(database)}`);
      await admin.end();
    }
  }
});
