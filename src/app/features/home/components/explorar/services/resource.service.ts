import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';

import { ApiClientService } from '../../../../../shared/services/api-client.service';
import {
  AcademicResource,
  CreateResourceInput,
  ResourceCategory,
  ResourceFilter,
  ResourceRating,
  UpdateResourceInput,
} from '../../../../../interfaces/resources';
import {
  CREATE_RESOURCE_MUTATION,
  DELETE_RESOURCE_MUTATION,
  GET_MY_RESOURCES_QUERY,
  GET_RESOURCE_BY_ID_QUERY,
  GET_RESOURCE_CATEGORIES_QUERY,
  GET_RESOURCE_DOWNLOAD_URL_QUERY,
  GET_RESOURCES_QUERY,
  RATE_RESOURCE_MUTATION,
  UPDATE_RESOURCE_MUTATION,
} from '../../../../../graphql/queries/resource.queries';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private readonly apollo = inject(Apollo);
  private readonly api = inject(ApiClientService);

  getResources(
    limit = 20,
    offset = 0,
    filter?: ResourceFilter,
  ): Observable<AcademicResource[]> {
    return this.apollo
      .watchQuery<{ resources: AcademicResource[] }>({
        query: GET_RESOURCES_QUERY,
        variables: { limit, offset, filter },
      })
      .valueChanges.pipe(
        map((res) => (res.data ? (res.data.resources as AcademicResource[]) : []))
      );
  }

  getResourceById(id: string): Observable<AcademicResource> {
    return this.apollo
      .query<{ resourceById: AcademicResource }>({
        query: GET_RESOURCE_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((res) => {
          if (!res.data?.resourceById) {
            throw new Error('Resource not found in response');
          }
          return res.data.resourceById as AcademicResource;
        })
      );
  }

  getMyResources(limit = 20, offset = 0): Observable<AcademicResource[]> {
    return this.apollo
      .watchQuery<{ myResources: AcademicResource[] }>({
        query: GET_MY_RESOURCES_QUERY,
        variables: { limit, offset },
      })
      .valueChanges.pipe(
        map((res) => (res.data ? (res.data.myResources as AcademicResource[]) : []))
      );
  }

  getResourceCategories(careerId?: string): Observable<ResourceCategory[]> {
    return this.apollo
      .watchQuery<{ resourceCategories: ResourceCategory[] }>({
        query: GET_RESOURCE_CATEGORIES_QUERY,
        variables: { careerId: careerId ?? null },
      })
      .valueChanges.pipe(
        map((res) => (res.data ? (res.data.resourceCategories as ResourceCategory[]) : []))
      );
  }

  getResourceDownloadUrl(resourceId: string): Observable<string> {
    return this.apollo
      .query<{ resourceDownloadUrl: string }>({
        query: GET_RESOURCE_DOWNLOAD_URL_QUERY,
        variables: { resourceId },
      })
      .pipe(map((res) => res.data!.resourceDownloadUrl));
  }

  uploadResource(
    file: File,
    input: CreateResourceInput,
  ): Observable<AcademicResource> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'data',
      new Blob([JSON.stringify(input)], { type: 'application/json' }),
    );

    return this.api.post<AcademicResource>('/resources/upload', formData);
  }

  createResource(input: CreateResourceInput): Observable<AcademicResource> {
    return this.apollo
      .mutate<{ createResource: AcademicResource }>({
        mutation: CREATE_RESOURCE_MUTATION,
        variables: { input },
      })
      .pipe(map((res) => res.data!.createResource));
  }

  updateResource(
    id: string,
    input: UpdateResourceInput,
  ): Observable<AcademicResource> {
    return this.apollo
      .mutate<{ updateResource: AcademicResource }>({
        mutation: UPDATE_RESOURCE_MUTATION,
        variables: { id, input },
      })
      .pipe(map((res) => res.data!.updateResource));
  }

  deleteResource(id: string): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteResource: boolean }>({
        mutation: DELETE_RESOURCE_MUTATION,
        variables: { id },
      })
      .pipe(map((res) => res.data!.deleteResource));
  }

  rateResource(resourceId: string, rating: number): Observable<ResourceRating> {
    return this.apollo
      .mutate<{ rateResource: ResourceRating }>({
        mutation: RATE_RESOURCE_MUTATION,
        variables: { resourceId, rating },
      })
      .pipe(map((res) => res.data!.rateResource));
  }
}
