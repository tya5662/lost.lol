import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { User } from '../model/profiles';

const router = Router();
router.use(isAuthenticated);

// Autopilot is restricted to the primary owner. These endpoints are read-only;
// deployment and repair actions will be added only behind explicit safety gates.
router.use(async (req: Request, res: Response, next) => {
  try {
    const actorId = (req.user as any)?.id;
    const actor = await User.findOne({ id: actorId }).select('rootOwner role').lean() as any;
    if (!actor?.rootOwner) {
      res.status(403).json({ message: 'Only the primary owner can access Suffer Autopilot.' });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const safeJson = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}`);
  return response.json();
};

router.get('/status', async (_req, res, next) => {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    const vercelTeamId = process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID;
    const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    const [vercel, github] = await Promise.all([
      (async () => {
        if (!vercelToken || !vercelProjectId || !vercelTeamId) {
          return { connected: false, reason: 'Missing VERCEL_TOKEN, VERCEL_PROJECT_ID, or VERCEL_TEAM_ID server configuration.', deployments: [] };
        }
        try {
          const params = new URLSearchParams({ projectId: vercelProjectId, limit: '8', teamId: vercelTeamId });
          const data: any = await safeJson(`https://api.vercel.com/v6/deployments?${params}`, vercelToken);
          return {
            connected: true,
            deployments: (data.deployments || []).map((item: any) => ({
              id: String(item.uid || item.id || ''),
              url: item.url ? `https://${item.url}` : '',
              state: String(item.state || item.readyState || 'UNKNOWN'),
              target: item.target || 'preview',
              createdAt: item.createdAt || item.created || null,
              branch: item.meta?.githubCommitRef || '',
              commit: item.meta?.githubCommitSha || '',
              message: item.meta?.githubCommitMessage || '',
            })),
          };
        } catch (error) {
          return { connected: false, reason: error instanceof Error ? error.message : 'Vercel request failed.', deployments: [] };
        }
      })(),
      (async () => {
        if (!githubToken) return { connected: false, reason: 'Missing GITHUB_TOKEN server configuration.', runs: [] };
        try {
          const data: any = await safeJson('https://api.github.com/repos/tya5662/lost.lol/actions/runs?per_page=8', githubToken);
          return {
            connected: true,
            runs: (data.workflow_runs || []).map((run: any) => ({
              id: run.id,
              name: run.name || run.display_title || 'GitHub Actions',
              status: run.status || 'unknown',
              conclusion: run.conclusion || null,
              branch: run.head_branch || '',
              commit: run.head_sha || '',
              url: run.html_url || '',
              createdAt: run.created_at || null,
            })),
          };
        } catch (error) {
          return { connected: false, reason: error instanceof Error ? error.message : 'GitHub request failed.', runs: [] };
        }
      })(),
    ]);

    res.setHeader('Cache-Control', 'no-store');
    res.json({ readOnly: true, checkedAt: new Date().toISOString(), integrations: { vercel, github } });
  } catch (error) {
    next(error);
  }
});

export default router;
