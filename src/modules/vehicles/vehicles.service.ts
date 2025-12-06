import { pool } from "../../config/db";
import { ZodCreateVehicle, ZodUpdateVehicle } from "./vehicles.validation";

const createVehicle = async (payload: ZodCreateVehicle) => {
  const {
    availability_status,
    daily_rent_price,
    registration_number,
    type,
    vehicle_name,
  } = payload;

  const result = await pool.query(
    `INSERT INTO vehicles 
    (   
    vehicle_name, type,  registration_number, daily_rent_price,availability_status
    )
    
    VALUES ($1, $2, $3, $4, $5) RETURNING id, vehicle_name, type,  registration_number, daily_rent_price,availability_status`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );

  return result;
};

const getVehicleById = async (vehicleId: string) => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [
    vehicleId,
  ]);
  return result;
};

const getVehicles = async () => {
  const result = await pool.query(`SELECT * FROM vehicles`);
  return result;
};

const updateVehicleById = async (id: string, payload: ZodUpdateVehicle) => {
  const fields = Object.keys(payload);
  const values = Object.values(payload);

  if (fields.length === 0) {
    throw new Error("No fields provided to update");
  }
  const setQuery = fields
    .map((field, idx) => `${field} = $${idx + 1}`)
    .join(", ");

  const sql = `
    UPDATE vehicles 
    SET ${setQuery}
    WHERE id = $${fields.length + 1}
    RETURNING *;
  `;

  const result = await pool.query(sql, [...values, id]);

  return result;
};

const deleteVehicleById = async (vehicleId: string) => {
  const result = await pool.query(`DELETE FROM vehicles WHERE id = $1`, [
    vehicleId,
  ]);
  return result;
};

export const vehicleServices = {
  getVehicleById,
  createVehicle,
  getVehicles,
  updateVehicleById,
  deleteVehicleById,
};
