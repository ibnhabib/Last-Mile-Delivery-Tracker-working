import { Request, Response, NextFunction } from 'express';
import * as agentService from './agent.service';
import { ApiResponse } from '../../utils/apiResponse';

export async function getAllAgents(req: Request, res: Response, next: NextFunction) {
  try {
    const { zoneId } = req.query;
    const agents = await agentService.getAllAgents(zoneId as string);
    return ApiResponse.success(res, agents, 'Agents retrieved');
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    let agentId = req.params.id;

    if (req.user!.role !== 'ADMIN') {
      const agent = await agentService.getAgentByUserId(req.user!.userId);
      if (!agent) return ApiResponse.error(res, 'Agent profile not found', 404);
      agentId = agent.id;
    }

    const updated = await agentService.updateAgentStatus(agentId, status);
    return ApiResponse.success(res, updated, 'Status updated');
  } catch (err) {
    next(err);
  }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const { zoneId, currentArea } = req.body;
    let agentId = req.params.id;

    if (req.user!.role !== 'ADMIN') {
      const agent = await agentService.getAgentByUserId(req.user!.userId);
      if (!agent) return ApiResponse.error(res, 'Agent profile not found', 404);
      agentId = agent.id;
    }

    const updated = await agentService.updateAgentLocation(agentId, zoneId, currentArea);
    return ApiResponse.success(res, updated, 'Location updated');
  } catch (err: any) {
    if (err.message === 'Zone not found') {
      return ApiResponse.error(res, err.message, 404);
    }
    next(err);
  }
}

export async function getMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const agent = await agentService.getAgentByUserId(req.user!.userId);
    if (!agent) return ApiResponse.error(res, 'Agent profile not found', 404);
    return ApiResponse.success(res, agent, 'Agent profile retrieved');
  } catch (err) {
    next(err);
  }
}