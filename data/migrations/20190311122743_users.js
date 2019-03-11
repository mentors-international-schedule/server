exports.up = function(knex, Promise) {
  return knex.schema.createTable("users", tbl => {
    tbl.increments();
    tbl
      .string("email")
      .notNullable()
      .unique();
    tbl.string("firstname").notNullable();
    tbl.string("lastname").notNullable();
    tbl.string("password").notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("users");
};
