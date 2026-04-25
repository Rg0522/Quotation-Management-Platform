import { Quotation, Comment, Reply, QuotationStatus } from "./types";

// Mock data
const mockQuotations: Quotation[] = [
  {
    id: "Q-101",
    client: "Acme Corp",
    amount: 12000,
    status: "Pending",
    last_updated: "2025-01-15T10:30:00Z",
    description: "Bulk order for corrugated pipes and fan boxes",
    lineItems: [
      {
        id: "1",
        description: "Corrugated Pipe 25mm",
        quantity: 500,
        unit: "M",
        rate: 24.5,
        amount: 12250,
      },
      {
        id: "2",
        description: "GI Fan Box Medium",
        quantity: 40,
        unit: "PC",
        rate: 220,
        amount: 8800,
      },
    ],
    subtotal: 21050,
    tax: 3789,
    freight: 1000,
    comments: [
      {
        id: 1,
        author: "Aakash Mishra",
        role: "sales_rep",
        text: "Client requested discount for bulk order.",
        timestamp: "2025-01-15T10:45:00Z",
        replies: [
          {
            id: 11,
            author: "Abhinav Sharma",
            role: "manager",
            text: "Approved 5% discount for orders above 10k.",
            timestamp: "2025-01-15T11:00:00Z",
          },
        ],
      },
    ],
  },
  {
    id: "Q-102",
    client: "TechFlow Industries",
    amount: 8500,
    status: "Approved",
    last_updated: "2025-01-14T14:20:00Z",
    description: "PVC conduit supply for construction project",
    comments: [],
  },
  {
    id: "Q-103",
    client: "BuildRight Ltd",
    amount: 15300,
    status: "Pending",
    last_updated: "2025-01-14T09:15:00Z",
    description: "Mixed materials for renovation project",
    comments: [],
  },
  {
    id: "Q-104",
    client: "Manufacturing Pro",
    amount: 22000,
    status: "Approved",
    last_updated: "2025-01-13T16:45:00Z",
    comments: [],
  },
  {
    id: "Q-105",
    client: "Steel Dynamics",
    amount: 5200,
    status: "Rejected",
    last_updated: "2025-01-13T12:30:00Z",
    comments: [],
  },
  {
    id: "Q-106",
    client: "Precision Parts",
    amount: 18900,
    status: "Pending",
    last_updated: "2025-01-12T11:00:00Z",
    comments: [],
  },
  {
    id: "Q-107",
    client: "Global Logistics",
    amount: 9800,
    status: "Approved",
    last_updated: "2025-01-12T08:30:00Z",
    comments: [],
  },
];

// Simulate network delay
const delay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// API functions
export const mockApi = {
  // Quotations
  async getQuotations(
    search?: string,
    status?: QuotationStatus | "",
    page: number = 1,
    pageSize: number = 10,
  ) {
    await delay();

    let filtered = [...mockQuotations];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.client.toLowerCase().includes(searchLower) ||
          q.id.toLowerCase().includes(searchLower),
      );
    }

    if (status && status !== "") {
      filtered = filtered.filter((q) => q.status === status);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const paginatedQuotations = filtered.slice(start, start + pageSize);

    return {
      data: paginatedQuotations,
      total,
      page,
      pageSize,
    };
  },

  async getQuotationById(id: string) {
    await delay();
    const quotation = mockQuotations.find((q) => q.id === id);
    if (!quotation) throw new Error("Quotation not found");
    return quotation;
  },

  async updateQuotation(id: string, updates: Partial<Quotation>) {
    await delay();
    const index = mockQuotations.findIndex((q) => q.id === id);
    if (index === -1) throw new Error("Quotation not found");

    mockQuotations[index] = {
      ...mockQuotations[index],
      ...updates,
      last_updated: new Date().toISOString(),
    };

    return mockQuotations[index];
  },

  async updateQuotationStatus(
    id: string,
    status: QuotationStatus,
    reason?: string,
  ) {
    await delay();
    return this.updateQuotation(id, { status });
  },

  // Comments
  async addComment(
    quotationId: string,
    author: string,
    role: string,
    text: string,
  ) {
    await delay();
    const quotation = mockQuotations.find((q) => q.id === quotationId);
    if (!quotation) throw new Error("Quotation not found");

    const newComment: Comment = {
      id: Math.max(...quotation.comments.map((c) => c.id), 0) + 1,
      author,
      role: role as any,
      text,
      timestamp: new Date().toISOString(),
      replies: [],
    };

    quotation.comments.push(newComment);
    return newComment;
  },

  async addReply(
    commentId: number,
    quotationId: string,
    author: string,
    role: string,
    text: string,
  ) {
    await delay();
    const quotation = mockQuotations.find((q) => q.id === quotationId);
    if (!quotation) throw new Error("Quotation not found");

    const comment = quotation.comments.find((c) => c.id === commentId);
    if (!comment) throw new Error("Comment not found");

    const newReply: Reply = {
      id: Math.max(...(comment.replies?.map((r) => r.id) || []), 10) + 1,
      author,
      role: role as any,
      text,
      timestamp: new Date().toISOString(),
    };

    if (!comment.replies) comment.replies = [];
    comment.replies.push(newReply);

    return newReply;
  },

  async loadReplies(commentId: number, quotationId: string) {
    await delay(500);
    const quotation = mockQuotations.find((q) => q.id === quotationId);
    if (!quotation) throw new Error("Quotation not found");

    const comment = quotation.comments.find((c) => c.id === commentId);
    if (!comment) throw new Error("Comment not found");

    return comment.replies || [];
  },

  // Auth
  async validateCredentials(email: string, password: string) {
    await delay();
    const users = JSON.parse(localStorage.getItem("pactle_users") || "[]");
    const user = users.find(
      (u: any) => u.email === email && u.password === password,
    );
    if (!user) throw new Error("Invalid credentials");
    return user;
  },

  async createUser(
    name: string,
    email: string,
    password: string,
    role: string = "viewer",
  ) {
    await delay();
    const users = JSON.parse(localStorage.getItem("pactle_users") || "[]");
    if (users.find((u: any) => u.email === email)) {
      throw new Error("Email already exists");
    }

    const newUser = {
      id: "user_" + Date.now(),
      name,
      email,
      password,
      role,
    };

    users.push(newUser);
    localStorage.setItem("pactle_users", JSON.stringify(users));
    return newUser;
  },
};
