require("dotenv").config();
const server = require("./server");

server.get("*", (req, res) => {
  res.send(
    '<h1 style="color: red; text-align: center;">Mentors International API</h1>'
  );
});
const port = process.env.PORT || 3333;

server.listen(port, () => console.log(`Listening on port ${port}`));
