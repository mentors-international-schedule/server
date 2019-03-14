exports.up = function(knex, Promise) {
  return knex.schema.createTable("scheduled", tbl => {
    tbl.increments();
    tbl.integer("hour").notNullable();
    tbl.integer("minute").notNullable();
    tbl.integer("dayOfWeek").notNullable();
    tbl.string("message").notNullable();
    tbl
      .integer("user_id")
      .references("id")
      .inTable("users");
    tbl
      .integer("group_id")
      .references("id")
      .inTable("groups");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("scheduled");
};
