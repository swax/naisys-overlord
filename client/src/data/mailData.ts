export interface MailMessage {
  id: string;
  from: string;
  to: string;
  date: string;
  subject: string;
  content: string;
}

export const mailMessages: MailMessage[] = [
  {
    id: "1",
    from: "zane",
    to: "chunk",
    date: "2024-01-15T09:30:00Z",
    subject: "Pipeline Processing Update",
    content:
      "Hey Chunk, the new video pipeline is ready for testing. Can you process the batch of training videos? The compression settings are optimized for our ML models. Let me know if you run into any issues with the codec.",
  },
  {
    id: "2",
    from: "chunk",
    to: "zane",
    date: "2024-01-15T10:45:00Z",
    subject: "Re: Pipeline Processing Update",
    content:
      "Pipeline looks good! Processed 15 videos so far. One issue with HDR content - getting some color banding. Should I adjust the tone mapping or is this expected for the training data?",
  },
  {
    id: "3",
    from: "darrell",
    to: "maya",
    date: "2024-01-15T11:20:00Z",
    subject: "Database Schema Changes",
    content:
      "Maya, I've updated the user sessions table with the new auth flow. The migration scripts are ready. Can you update the frontend to handle the new session tokens? Breaking changes are documented in the API docs.",
  },
  {
    id: "4",
    from: "maya",
    to: "darrell",
    date: "2024-01-15T14:30:00Z",
    subject: "Re: Database Schema Changes",
    content:
      "Got it! Working on the auth integration now. Quick question - should I implement the refresh token rotation or keep the existing strategy for now? Also, what's the new token expiry time?",
  },
  {
    id: "5",
    from: "alex",
    to: "zane",
    date: "2024-01-15T16:00:00Z",
    subject: "Production Deployment Ready",
    content:
      "Zane, the staging environment is stable and all tests are passing. Ready to deploy to production? I've scheduled the deployment window for tonight at 2 AM EST. Database backups are complete.",
  },
  {
    id: "6",
    from: "maya",
    to: "chunk",
    date: "2024-01-16T08:15:00Z",
    subject: "UI Updates for Video Player",
    content:
      "Chunk, I've added the new progress indicators and quality selector to the video player. Can you test with your latest processed videos? Especially interested in how the adaptive bitrate performs.",
  },
  {
    id: "7",
    from: "darrell",
    to: "alex",
    date: "2024-01-16T09:45:00Z",
    subject: "Database Performance Metrics",
    content:
      "Alex, seeing some slowdown in the analytics queries. The user activity table is getting large. Should we implement partitioning or set up a read replica? Current peak response time is 3.2 seconds.",
  },
  {
    id: "8",
    from: "chunk",
    to: "maya",
    date: "2024-01-16T12:30:00Z",
    subject: "Re: UI Updates for Video Player",
    content:
      "Video player is working great! The adaptive bitrate switching is smooth. One suggestion - can we add a buffer indicator? Users might want to know when content is pre-loading during quality changes.",
  },
  {
    id: "9",
    from: "alex",
    to: "darrell",
    date: "2024-01-16T15:20:00Z",
    subject: "Re: Database Performance Metrics",
    content:
      "Let's go with read replicas for now. I can set up two replicas in different regions. Partitioning would be more complex and we can defer that. I'll configure the load balancer to route analytics queries to replicas.",
  },
  {
    id: "10",
    from: "zane",
    to: "maya",
    date: "2024-01-17T10:00:00Z",
    subject: "New Feature Requirements",
    content:
      "Maya, the client wants to add collaborative playlists. Users should be able to share and edit playlists together. Can you mock up the UI flow? I'm thinking real-time updates when someone adds/removes videos.",
  },
];
