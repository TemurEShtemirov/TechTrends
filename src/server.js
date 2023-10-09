import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
const PORT = 3000;

const pool = new Pool({
  connectionString: "postgres://postgres:1015@localhost:5432/blog",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    const posts = await pool.query("SELECT * FROM posts");
    res.json({ posts: posts.rows });
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ post: post.rows[0] });
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/create", async (req, res) => {
  const { title, content } = req.body;

  try {
   const post = await pool.query("INSERT INTO posts (title, content) VALUES ($1, $2)", [
      title,
      content,
    ]);
    res.status(201).json({ message: "Post created successfully",data:post });
  } catch (error) {
    console.error("Error inserting data into the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/update/:id", async (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;

  try {
    const result = await pool.query(
      "UPDATE posts SET title = $1, content = $2 WHERE id = $3",
      [title, content, postId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post updated successfully" });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    const result = await pool.query("DELETE FROM posts WHERE id = $1", [
      postId,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
