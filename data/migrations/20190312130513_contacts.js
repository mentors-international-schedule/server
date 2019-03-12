exports.up = function(knex, Promise) {
  return knex.schema.createTable("contacts", tbl => {
    tbl.increments();
    tbl.string("name").notNullable();
    tbl.string("phone_number").notNullable();
    tbl
      .integer("group_id")
      .references("id")
      .inTable("groups");
    tbl.unique(["group_id", "phone_number"]);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("contacts");
};
