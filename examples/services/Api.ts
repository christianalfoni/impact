import { Disposable, Service, Signal, emitter, useService } from "impact-app";

export function generateId() {
  return (
    Math.round(Math.random() * 1000) + "-" + Math.round(Math.random() * 1000)
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type PostDTO = {
  id: string;
  title: string;
  updateCount: number;
};

const UPDATE_POST_INTERVAL = 1500;

@Service()
export class ApiService extends Disposable {
  private _serverPosts: { [id: string]: PostDTO } = {};

  @Signal()
  private _version = 0;
  get version() {
    return this._version;
  }

  private _onPostUpdateEmitter = emitter<PostDTO>();
  onPostUpdate = this._onPostUpdateEmitter.on;

  private _onNewPostEmitter = emitter<PostDTO>();
  onNewPost = this._onNewPostEmitter.on;

  constructor() {
    super();
    this.configurePostsUpdateInterval();
  }

  private configurePostsUpdateInterval() {
    const updateExistingPosts = () => {
      for (const postId in this._serverPosts) {
        const post = this._serverPosts[postId];
        const newPost: PostDTO = {
          ...post,
          updateCount: post.updateCount + 1,
        };
        this._serverPosts[postId] = newPost;
        this._onPostUpdateEmitter.emit(newPost);
      }
    };
    const updateExistingPostsInterval = setInterval(
      updateExistingPosts,
      UPDATE_POST_INTERVAL
    );
    this.onDispose(() => clearInterval(updateExistingPostsInterval));
  }

  async getPost(id: string) {
    await sleep(2000);

    let post = this._serverPosts[id];

    if (!post) {
      this._serverPosts[id] = post = {
        id,
        title: "New post",
        updateCount: 0,
      };
    }

    return post;
  }

  addPost() {
    const id = generateId();
    const post = {
      id,
      title: "Server post",
      updateCount: 0,
    };
    this._serverPosts[id] = post;
    this._onNewPostEmitter.emit(post);
  }

  clear() {
    this._serverPosts = {};
    this._version++;
  }
}

export const useApi = () => useService(ApiService);
