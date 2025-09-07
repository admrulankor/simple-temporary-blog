import express from 'express';
import path from 'path';
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import TurndownService from 'turndown';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// EJS setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const turndownService = new TurndownService();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.urlencoded({ extended: true }));

// Temporary in-memory data
let posts = [];

// Routes
app.get('/', (req, res) => {
    // Map posts to include their original index
    const postsWithIndex = posts.map((post, idx) => ({ ...post, idx }));
    // Reverse the array for descending order
    res.render('index', { posts: postsWithIndex.reverse() });
});

app.get('/new', (req, res) => {
    res.render('new');
});

app.post('/posts', (req, res) => {
    const { title, content } = req.body;
    const md = sanitizeHtml(marked.parse(content));
    posts.push({ title, content: md });
    res.redirect('/');
});

app.get('/posts/:id', (req, res) => {
    const post = posts[req.params.id];
    if (!post) return res.status(404).send('Post not found');
    res.render('post', { post, id: req.params.id });
});

app.get('/posts/:id/edit', (req, res) => {
    const post = posts[req.params.id];
    if (!post) return res.status(404).send('Post not found');
    const md = turndownService.turndown(post.content);
    res.render('edit', { post, md, id: req.params.id });
});

app.post('/posts/:id/edit', (req, res) => {
    const { title, content } = req.body;
    const md = sanitizeHtml(marked.parse(content));
    const id = req.params.id;
    if (!posts[id]) return res.status(404).send('Post not found');
    posts[id] = { title, content: md };
    res.redirect(`/posts/${id}`);
});

app.post('/posts/:id/delete', (req, res) => {
    const id = req.params.id;
    if (!posts[id]) return res.status(404).send('Post not found');
    posts.splice(id, 1);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});