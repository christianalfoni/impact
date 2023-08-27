import { Disposable, Service, SuspensePromise, useService } from "impact-app";
import { ApiService, PostDTO } from "../../../services/Api";

/*
    This service caches any opened post
*/
@Service()
export class PostsCacheService extends Disposable {
  private _cache: { [id: string]: SuspensePromise<PostDTO> } = {};

  constructor(private _api: ApiService) {
    super();
  }

  getPost(id: string) {
    let post = this._cache[id];

    if (!post) {
      this._cache[id] = post = SuspensePromise.from(this._api.getPost(id));
    }

    return post;
  }
}

export const usePostsCache = () => useService(PostsCacheService);
