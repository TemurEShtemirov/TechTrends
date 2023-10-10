import express from "express";
import pkg from "pg";
const { Pool } = pkg;
import cors from 'cors'

const app = express();
const PORT = 8080;

const pool = new Pool({
  connectionString: "postgres://postgres:1015@localhost:5432/blog",
});

app.use(express.json());
app.use(cors())

app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts");
    const posts = result.rows;
    res.json({ posts });
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/posts/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post retrieved successfully", post: result.rows[0] });
  } catch (error) {
    console.error("Error retrieving post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/posts", async (req, res) => {
  const { title, content } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *",
      [title, content]
    );
    const newPost = result.rows[0];
    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error inserting data into the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/posts/:id", async (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;

  try {
    const result = await pool.query(
      "UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *",
      [title, content, postId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post updated successfully", post: result.rows[0] });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/posts/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [postId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully", post: result.rows[0] });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
