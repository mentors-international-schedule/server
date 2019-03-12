exports.up = function(knex, Promise) {
  return knex.schema.createTable("userOrganizations", tbl => {
    tbl
      .integer("user_id")
      .references("id")
      .inTable("users");
    tbl
      .integer("organization_id")
      .references("id")
      .inTable("organizations");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("userOrganizatiosn");
};
