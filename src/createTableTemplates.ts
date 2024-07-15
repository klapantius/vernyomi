export class CreateTableTemplates {
    public static Sessions = `create table if not exists sessions (
        session_id int auto_increment,
        started_at timestamp default current_timestamp,
        primary key(session_id)
    );`; // no engine specification ==> InnoDB will be applied as default

    public static Measurements = `create table if not exists measurments (
        measurement_id int auto_increment,
        session_id int,
        created_at timestamp default current_timestamp,
        sys int,
        dia int,
        pulse int,
        primary key(measurement_id, session_id),
        foreign key(session_id)
            references sessions(session_id)
    );`; // no engine specification ==> InnoDB will be applied as default

};