exports.up = function(knex, Promise) {
  return knex.schema.createTable("messagesContacts", tbl => {
    tbl
      .integer("message_id")
      .references("id")
      .inTable("messages");
    tbl
      .integer("contact_id")
      .references("id")
      .inTable("contacts");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("messagesContacts");
};
