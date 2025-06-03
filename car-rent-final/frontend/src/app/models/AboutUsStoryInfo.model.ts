export interface AboutUsStoryItem {
    description: string;
    numericValue: number;  // ✅ should be number, not string
    title: string;
}

export interface AboutUsStoryResponse {
    content: AboutUsStoryItem[];
}