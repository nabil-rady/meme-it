import { Memes, CaptionDetails } from "@prisma/client";

export type DMeme = Memes;
export type DCaptionDetails = CaptionDetails;
export type DMemeWithCaptionDetails = DMeme & {
  captionsDetails: DCaptionDetails[];
};
