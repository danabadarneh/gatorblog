"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.getUserByName = getUserByName;
exports.deleteAllUsers = deleteAllUsers;
exports.getUsers = getUsers;
const __1 = require("..");
const schema_1 = require("../../schema");
const drizzle_orm_1 = require("drizzle-orm");
async function createUser(name) {
    const [result] = await __1.db.insert(schema_1.users).values({ name }).returning();
    return result;
}
async function getUserByName(name) {
    const [result] = await __1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.name, name));
    return result;
}
async function deleteAllUsers() {
    await __1.db.delete(schema_1.users);
}
async function getUsers() {
    return await __1.db.select().from(schema_1.users);
}
