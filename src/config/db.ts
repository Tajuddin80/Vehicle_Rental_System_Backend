import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
  connectionString: `${config.connection_str}` as string,
});

const initDB = async () => {
  try {
    // Create ENUM types with proper error handling
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'customer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE vehicle_type AS ENUM ('car', 'bike', 'van', 'SUV');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE booking_status AS ENUM ('active', 'cancelled', 'returned');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE status AS ENUM ('available', 'booked');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users ( 
        id SERIAL PRIMARY KEY, 
        name VARCHAR(100) NOT NULL, 
        email VARCHAR(100) UNIQUE NOT NULL, 
        password VARCHAR(150) NOT NULL, 
        phone VARCHAR(100) NOT NULL, 
        role user_role NOT NULL, 
        CONSTRAINT min_password_length CHECK (LENGTH(password) >= 6),
        CONSTRAINT email_lowercase CHECK (email = LOWER(email))
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles ( 
        id SERIAL PRIMARY KEY, 
        vehicle_name VARCHAR(100) NOT NULL, 
        type vehicle_type NOT NULL, 
        registration_number VARCHAR(100) UNIQUE NOT NULL, 
        daily_rent_price FLOAT NOT NULL CHECK (daily_rent_price > 0), 
        availability_status status NOT NULL 
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings ( 
        id SERIAL PRIMARY KEY, 
        customer_id INTEGER NOT NULL, 
        vehicle_id INTEGER NOT NULL, 
        rent_start_date DATE NOT NULL, 
        rent_end_date DATE NOT NULL, 
        total_price FLOAT NOT NULL CHECK (total_price > 0), 
        status booking_status NOT NULL, 

        
        CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE, 
        CONSTRAINT fk_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE, 
        CONSTRAINT valid_rent_dates CHECK (rent_end_date > rent_start_date) 
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_status_end_date 
      ON bookings(status, rent_end_date);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_status 
      ON bookings(vehicle_id, status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vehicles_status 
      ON vehicles(availability_status);
    `);

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};

export default initDB;
