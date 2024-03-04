DROP TABLE IF EXISTS items;

CREATE TABLE lists (
  id serial primary key,
  listTitle VARCHAR(100) NOT NULL
);

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  listId INT REFERENCES lists(id)
);
INSERT INTO lists (listTitle) VALUES ('Today'),('March');
INSERT INTO items (title,listID) VALUES ('Buy milk',1), ('Finish homework',2);