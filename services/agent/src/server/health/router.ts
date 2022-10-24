import { Router } from "express";
import { prisma } from "../../libs/prisma";

const healthRouter: Router = Router();

healthRouter.get("/probe", async (req, res) => {
  try {
    await prisma.doc.count();

    return res.status(200).send();
  } catch (err) {
    return res.status(500).send();
  }
});

export { healthRouter };
