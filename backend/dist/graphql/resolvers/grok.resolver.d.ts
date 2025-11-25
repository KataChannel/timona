import { GrokService } from '../../grok/grok.service';
import { PostService } from '../../services/post.service';
export declare class GrokResolver {
    private readonly grokService;
    private readonly postService;
    constructor(grokService: GrokService, postService: PostService);
    generateSummary(content: string, maxLength: number): Promise<string>;
    generatePostSummary(postId: string): Promise<string>;
    generateTags(content: string, maxTags: number): Promise<string[]>;
    improveContent(content: string, instruction: string): Promise<string>;
}
