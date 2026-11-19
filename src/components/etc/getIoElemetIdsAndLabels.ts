/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import constant from '@/config/constant.js';

export function Controller(req: Request, res: Response, next: NextFunction) {
  res.status(200).json({
    ioElementLabels: constant.ioElementLabels,
    ioElementParameterIds: constant.ioElementParameterIds,
  });
}
