import {
  Disposable,
  Service,
  Signal,
  SuspensePromise,
  useService,
} from "impact-app";
import { ApiService } from "../../../services/Api";
import type { PostDTO } from "../../../services/Api";

/*
    This service caches any opened post and subscribes to updates, keeping the
    instantiated posts up to date
*/
class Post {
  @Signal()
  private _data: PostDTO;

  get id() {
    return this._data.id;
  }
  get title() {
    return this._data.title;
  }
  get updateCount() {
    return this._data.updateCount;
  }

  constructor(data: PostDTO) {
    this._data = data;
  }

  updateData(data: PostDTO) {
    this._data = data;
  }
}

@Service()
export class PostsCacheService extends Disposable {
  private _cache: { [id: string]: SuspensePromise<Post> } = {};

  constructor(private _api: ApiService) {
    super();

    const onPostUpdate = (data: PostDTO) => this._updatePost(data);

    this.onDispose(_api.onPostUpdate(onPostUpdate));
  }

  private _updatePost(data: PostDTO) {
    const updateData = (post: Post) => post.updateData(data);

    this._cache[data.id].then(updateData);
  }

  getPost(id: string) {
    let post = this._cache[id];

    if (!post) {
      const createPost = (data: PostDTO) => new Post(data);

      this._cache[id] = post = SuspensePromise.from(
        this._api.getPost(id).then(createPost)
      );
    }

    return post;
  }
}

export const usePostsCache = () => useService(PostsCacheService);
