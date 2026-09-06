// utils/githubApiClient.js
import axios from 'axios';

/**
 * Creates a configured Axios client for GitHub REST API
 */
const createGithubClient = (accessToken) => {
  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
};

/**
 * Fetch all repositories where the user is an owner, collaborator, or org member
 */
// utils/githubApiClient.js (inside createGithubClient or API methods)
export const getUserRepos = async (accessToken) => {
  const client = createGithubClient(accessToken);
  try {
    const response = await client.get('/user/repos', {
      params: {
        affiliation: 'owner,collaborator,organization_member',
        sort: 'updated',
        per_page: 30,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('GITHUB_TOKEN_EXPIRED');
    }
    throw error;
  }
};
/**
 * Fetch commits made specifically by the given user's username in a repo
 */
export const getUserCommits = async (accessToken, owner, repo, githubUsername, since = null) => {
  const client = createGithubClient(accessToken);
  const params = {
    author: githubUsername,
    per_page: 20, // Inspect recent 20 commits per repo
  };

  if (since) {
    params.since = since;
  }

  try {
    const response = await client.get(`/repos/${owner}/${repo}/commits`, { params });
    return response.data;
  } catch (error) {
    // Return empty array if repo has no commits, is empty, or author has no commits
    if (error.response?.status === 409 || error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

/**
 * Fetch detailed commit info including the `files[]` array with patch diff text
 */
export const getCommitDiff = async (accessToken, owner, repo, sha) => {
  const client = createGithubClient(accessToken);
  try {
    const response = await client.get(`/repos/${owner}/${repo}/commits/${sha}`);
    return response.data.files || [];
  } catch (error) {
    console.error(`Failed to fetch diff for commit ${sha}:`, error.message);
    return [];
  }
};