exports.up = function(knex, Promise) {
  return knex.schema.createTable("messages", tbl => {
    tbl.increments();
    tbl.string("message").notNullable();
    tbl
      .integer("user_id")
      .references("id")
      .inTable("users");
    tbl.boolean("sent").defaultTo(true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("messages");
};
