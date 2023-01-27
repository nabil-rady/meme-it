-- CreateTable
CREATE TABLE "Memes" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Memes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaptionDetails" (
    "id" SERIAL NOT NULL,
    "memeId" INTEGER NOT NULL,
    "positionX" SMALLINT NOT NULL,
    "positionY" SMALLINT NOT NULL,
    "rotation" SMALLINT NOT NULL,
    "width" SMALLINT NOT NULL,
    "initialFontSize" SMALLINT NOT NULL,
    "maxNumberOfLines" SMALLINT NOT NULL,

    CONSTRAINT "CaptionDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CaptionDetails" ADD CONSTRAINT "CaptionDetails_memeId_fkey" FOREIGN KEY ("memeId") REFERENCES "Memes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
