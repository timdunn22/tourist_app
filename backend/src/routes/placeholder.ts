// Route placeholder exports
import { Router } from 'express';

const createPlaceholderRouter = (name: string) => {
  const router = Router();
  router.get('/', (req, res) => res.json({ message: `${name} endpoint` }));
  return router;
};

export default createPlaceholderRouter;
