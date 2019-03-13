exports.up = function(knex, Promise) {
  return knex.schema.createTable("scheduled", tbl => {
    tbl.increments();
    tbl.integer("hour").notNullable();
    tbl.integer("minute").notNullable();
    tbl.integer("dayOfWeek").notNullable();
    tbl
      .integer("user_id")
      .references("id")
      .inTable("users");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("scheduled");
};
