import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../db";

import { DMemeWithCaptionDetails } from "../../dbtypes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DMemeWithCaptionDetails>
): Promise<void> {
  const numberOfMemes = await prisma.memes.count();
  const skip = Math.floor(Math.random() * numberOfMemes);
  const meme = (await prisma.memes.findMany({
    skip,
    take: 1,
    include: {
      captionsDetails: true,
    },
  })) as DMemeWithCaptionDetails[];
  res.json(meme[0]);
}
