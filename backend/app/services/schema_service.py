from sqlalchemy import inspect, text


def ensure_runtime_schema(engine):
    inspector = inspect(engine)

    if "shipments" in inspector.get_table_names():
        shipment_columns = {
            column["name"]
            for column in inspector.get_columns("shipments")
        }

        if "customer_id" not in shipment_columns:
            with engine.begin() as connection:
                connection.execute(
                    text(
                        "ALTER TABLE shipments "
                        "ADD COLUMN customer_id INTEGER REFERENCES customers(id)"
                    )
                )

    if "finance" in inspector.get_table_names():
        finance_columns = {
            column["name"]
            for column in inspector.get_columns("finance")
        }

        with engine.begin() as connection:
            if "shipment_id" not in finance_columns:
                connection.execute(
                    text(
                        "ALTER TABLE finance "
                        "ADD COLUMN shipment_id INTEGER REFERENCES shipments(id)"
                    )
                )

            if "created_at" not in finance_columns:
                connection.execute(
                    text("ALTER TABLE finance ADD COLUMN created_at TIMESTAMP")
                )
