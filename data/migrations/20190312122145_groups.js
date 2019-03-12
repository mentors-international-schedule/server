exports.up = function(knex, Promise) {
  return knex.schema.createTable("groups", tbl => {
    tbl.increments();
    tbl.string("name").notNullable();
    tbl
      .integer("user_id")
      .references("id")
      .inTable("users");
    tbl.unique(["user_id", "name"]);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("groups");
};
