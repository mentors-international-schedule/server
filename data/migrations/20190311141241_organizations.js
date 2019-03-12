exports.up = function(knex, Promise) {
  return knex.schema.createTable("organizations", tbl => {
    tbl.increments();
    tbl
      .string("name")
      .notNullable()
      .unique();
    tbl
      .integer("user_id")
      .references("id")
      .inTable("users");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("organizations");
};
