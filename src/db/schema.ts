import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  pgEnum,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ENUMS - Defining data types with a limited set of values
// Enum for user roles in the system
export const roleEnum = pgEnum("role", [
  "Member",
  "Servant",
  "Pastor",
  "Admin",
]);
// Enum for gender
export const genderEnum = pgEnum("gender", ["Male", "Female"]);
// Enum for marital status
export const maritalStatusEnum = pgEnum("marital_status", [
  "Single",
  "Married",
  "Widowed",
]);
// Enum for church membership status
export const membershipStatusEnum = pgEnum("membership_status", [
  "Aktif",
  "Pindah",
  "NonAktif",
]);
// Enum for member's domicile status
export const domicileStatusEnum = pgEnum("domicile_status", [
  "Tetap",
  "Rantau",
  "Tamu",
]);
// Enum for ministry schedule confirmation status
export const scheduleStatusEnum = pgEnum("schedule_status", [
  "Pending",
  "Confirmed",
  "Declined",
]);
// Enum for attendance recording method
export const attendanceMethodEnum = pgEnum("attendance_method", [
  "QR_Scan",
  "Manual_Input",
]);
// Enum for announcement types
// export const announcementTypeEnum = pgEnum("announcement_type", [
//   "Announcement",
//   "Practice_Schedule",
//   "Joyful_News",
//   "Sorrowful_News",
//   "Other",
// ]);
// Enum for event registration status
export const registrationStatusEnum = pgEnum("registration_status", [
  "Registered",
  "Cancelled",
]);
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),

  role: roleEnum("role").default("Member").notNull(),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpiresAt: timestamp("ban_expires_at"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by_user_id").references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// MAIN TABLE - MEMBERS
// This table stores all personal and spiritual data for each church member.
export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  // fullName: varchar("full_name", { length: 255 }).notNull(),
  // email: varchar("email", { length: 255 }).unique(), // Email for login, must be unique
  // passwordHash: text("password_hash"), // To store the hashed login password
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // Personal Data
  gender: genderEnum("gender"),
  placeOfBirth: varchar("place_of_birth", { length: 100 }),
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  maritalStatus: maritalStatusEnum("marital_status"),
  occupation: varchar("occupation", { length: 100 }),
  lastEducation: varchar("last_education", { length: 100 }),
  // nationality: varchar("nationality", { length: 50 }).default("Indonesian"),
  domicileStatus: domicileStatusEnum("domicile_status"),
  originAddress: text("origin_address"), // To be filled if domicile_status = Non-Resident

  // Church Data
  baptismDate: date("baptism_date"),
  sidiConfirmationDate: date("sidi_confirmation_date"),
  membershipStatus: membershipStatusEnum("membership_status").default("Aktif"),
  joinDate: date("join_date"),
  previousChurch: varchar("previous_church", { length: 255 }),

  // Relations
  familyId: uuid("family_id").references(() => families.id),
  zoneId: uuid("zone_id").references(() => zones.id),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SUPPORTING TABLES
// Table to group members by family.
export const families = pgTable("families", {
  id: uuid("id").defaultRandom().primaryKey(),
  // familyName: varchar("family_name", { length: 255 }).notNull(),
});

// Table to group members by zone or cell group.
export const zones = pgTable("zones", {
  id: uuid("id").defaultRandom().primaryKey(),
  zoneName: varchar("zone_name", { length: 255 }).notNull(),
});

// CHURCH ACTIVITIES TABLES
// Table to store church announcements.
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  heroImage: varchar("hero_image", { length: 255 }),
  content: jsonb("content"),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: varchar("seo_description", { length: 255 }),
  metaImage: varchar("meta_image", { length: 255 }),
  // type: announcementTypeEnum("type").notNull(),
  publishDate: timestamp("publish_date"),
  authorId: uuid("author_id").references(() => members.id), // Admin/Pastor who published it
  slug: varchar("slug", { length: 255 }),
  isPublished: boolean("is_published").default(false).notNull(),
});

// Table for special church events.
export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: varchar("location", { length: 255 }),
  posterImage: varchar("poster_image", { length: 255 }),
  // personInChargeId: integer("person_in_charge_id").references(() => members.id),
});

// Table for regular worship service schedules.
export const worshipServices = pgTable("worship_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  theme: varchar("theme", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  speakerId: uuid("speaker_id").references(() => members.id),
  // liturgistId: integer("liturgist_id").references(() => members.id),
});

// Table to record members who register for an event.
export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  registrationDate: timestamp("registration_date").defaultNow().notNull(),
  status: registrationStatusEnum("status").default("Registered").notNull(),
});

// MINISTRY & SCHEDULING TABLES
// Master table for the types of ministries available.
export const ministries = pgTable("ministries", {
  id: uuid("id").defaultRandom().primaryKey(),
  ministryName: varchar("ministry_name", { length: 100 }).notNull().unique(), // e.g., 'Usher', 'Musician', 'Singer'
  description: text("description"),
});

// Table to record the ministry schedule for each servant.
export const ministrySchedules = pgTable("ministry_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  ministryId: uuid("ministry_id")
    .notNull()
    .references(() => ministries.id),
  // Ministry can be for a worship service or an event
  serviceId: uuid("service_id").references(() => worshipServices.id),
  eventId: uuid("event_id").references(() => events.id),
  dutyDate: date("duty_date").notNull(),
  status: scheduleStatusEnum("status").default("Pending").notNull(),
  notes: text("notes"), // Notes from admin or servant
  confirmedAt: timestamp("confirmed_at"),
});

// Table for servants to declare dates they are unavailable to serve.
export const unavailabilities = pgTable("unavailabilities", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  date: date("date").notNull(),
  reason: text("reason"), // Optional
});

// ATTENDANCE TABLE
// Table to record member attendance at each service or event.
export const attendance = pgTable("attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  // Attendance can be for a worship service or an event
  serviceId: uuid("service_id").references(() => worshipServices.id),
  eventId: uuid("event_id").references(() => events.id),
  attendanceTime: timestamp("attendance_time").defaultNow().notNull(),
  method: attendanceMethodEnum("method").notNull(),
  recordedById: uuid("recorded_by_id").references(() => members.id), // For manual method, filled by an Usher
});

// // RELATIONS - Defining relationships between tables for easier querying
// export const membersRelations = relations(members, ({ one, many }) => ({
//   family: one(families, {
//     fields: [members.familyId],
//     references: [families.id],
//   }),
//   zone: one(zones, {
//     fields: [members.zoneId],
//     references: [zones.id],
//   }),
//   ministrySchedules: many(ministrySchedules),
//   eventRegistrations: many(eventRegistrations),
//   attendanceRecords: many(attendance),
//   unavailabilities: many(unavailabilities),
//   // pastoralNotesAuthored: many(pastoralNotes, { relationName: "noteAuthor" }),
//   // pastoralNotesFor: many(pastoralNotes, { relationName: "noteSubject" }),
// }));

// export const familiesRelations = relations(families, ({ many }) => ({
//   members: many(members),
// }));

// export const zonesRelations = relations(zones, ({ one, many }) => ({
//   // leader: one(members, {
//   //   fields: [zones.leaderId],
//   //   references: [members.id],
//   // }),
//   members: many(members),
// }));

// export const eventsRelations = relations(events, ({ one, many }) => ({
//   // personInCharge: one(members, {
//   //   fields: [events.personInChargeId],
//   //   references: [members.id],
//   // }),
//   registrations: many(eventRegistrations),
//   attendanceRecords: many(attendance),
//   ministrySchedules: many(ministrySchedules),
// }));

// export const worshipServicesRelations = relations(
//   worshipServices,
//   ({ one, many }) => ({
//     speaker: one(members, {
//       fields: [worshipServices.speakerId],
//       references: [members.id],
//     }),
//     // liturgist: one(members, {
//     //   fields: [worshipServices.liturgistId],
//     //   references: [members.id],
//     // }),
//     attendanceRecords: many(attendance),
//     ministrySchedules: many(ministrySchedules),
//   })
// );

// export const eventRegistrationsRelations = relations(
//   eventRegistrations,
//   ({ one }) => ({
//     member: one(members, {
//       fields: [eventRegistrations.memberId],
//       references: [members.id],
//     }),
//     event: one(events, {
//       fields: [eventRegistrations.eventId],
//       references: [events.id],
//     }),
//   })
// );

// export const ministrySchedulesRelations = relations(
//   ministrySchedules,
//   ({ one }) => ({
//     member: one(members, {
//       fields: [ministrySchedules.memberId],
//       references: [members.id],
//     }),
//     ministry: one(ministries, {
//       fields: [ministrySchedules.ministryId],
//       references: [ministries.id],
//     }),
//     worshipService: one(worshipServices, {
//       fields: [ministrySchedules.serviceId],
//       references: [worshipServices.id],
//     }),
//     event: one(events, {
//       fields: [ministrySchedules.eventId],
//       references: [events.id],
//     }),
//   })
// );

// export const attendanceRelations = relations(attendance, ({ one }) => ({
//   member: one(members, {
//     fields: [attendance.memberId],
//     references: [members.id],
//   }),
//   worshipService: one(worshipServices, {
//     fields: [attendance.serviceId],
//     references: [worshipServices.id],
//   }),
//   event: one(events, {
//     fields: [attendance.eventId],
//     references: [events.id],
//   }),
//   recordedBy: one(members, {
//     fields: [attendance.recordedById],
//     references: [members.id],
//   }),
// }));

// // export const pastoralNotesRelations = relations(pastoralNotes, ({ one }) => ({
// //   member: one(members, {
// //     fields: [pastoralNotes.memberId],
// //     references: [members.id],
// //     relationName: "noteSubject",
// //   }),
// //   pastor: one(members, {
// //     fields: [pastoralNotes.pastorId],
// //     references: [members.id],
// //     relationName: "noteAuthor",
// //   }),
// // }));

// export const ministriesRelations = relations(ministries, ({ many }) => ({
//   schedules: many(ministrySchedules),
// }));
