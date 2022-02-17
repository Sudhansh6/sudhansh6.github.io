# Important Points

- Query language is not the same as DML.

> What else does a DML include? `create` is part of DML but not query.

- Assignments to permanent relations constitute a database modification.
- Primary keys are nonnull and unique.
- `drop table r` deletes the schema as well as the tuples whereas `delete from r` only deletes the tuples.

> Dropping attributes? Primary key?

- `all` to retain duplicates (default) and `unique/distinct` to eliminate the same.
- 