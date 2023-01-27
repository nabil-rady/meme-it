type DMeme = import("@prisma/client").Memes;
type DCaptionsDetails = import("@prisma/client").CaptionDetails;

type DMemeWithCaptionDetails = DMeme & { captionsDetails: DCaptionsDetails[] };
