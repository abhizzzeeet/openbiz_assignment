-- CreateTable
CREATE TABLE "udyam_forms" (
    "aadhaarnumber" TEXT NOT NULL,
    "aadhaarname" TEXT,
    "organisationtype" TEXT,
    "pannumber" TEXT,
    "panname" TEXT,
    "dob" TEXT,

    CONSTRAINT "udyam_forms_pkey" PRIMARY KEY ("aadhaarnumber")
);
