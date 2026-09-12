import {
  Component,
  OnInit,
  inject,ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';
import {
  FormsModule
} from '@angular/forms';
import {
  MatIconModule
} from '@angular/material/icon';

import {
  Router
} from '@angular/router';

import {
  ProfileService
} from '../../../../core/services/profile.service';

import {
  Profile,
  ProfileStats
} from '../../../../core/models/profile-model';

import {
  genUploader
} from 'uploadthing/client';


@Component({
  selector: 'app-profile',
  standalone: true,

  imports: [
    CommonModule,
    MatIconModule,FormsModule
  ],

  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileView implements OnInit {

  private profileService = inject(ProfileService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  profile: Profile | null = null;
  stats: ProfileStats | null = null;

  loading = true;
  savingName = false;
  uploadingImage = false;

  errorMessage = '';

  isEditingName = false;
  editedName = '';

  expandedGeekStat: string | null = null;

  selectedImagePreview: string | null = null;


  /*
   * UploadThing client.
   *
   * Our backend is separately hosted, so the complete
   * backend URL is provided here.
   */
  private uploadFiles = genUploader<{
    profilePicture: any;
  }>({
    url: 'https://habit-builder-backend-u1qh.onrender.com/api/uploadthing'
  }).uploadFiles;


  ngOnInit(): void {
    this.loadProfile();
    this.cdr.detectChanges();
  }


  loadProfile(): void {

    this.loading = true;
    this.errorMessage = '';

    this.profileService.getProfile().subscribe({

      next: (profile) => {

        this.profile = profile;
        this.editedName = profile.name;

        this.loadStats();
        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Failed to load profile:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          'Unable to load profile.';

        this.loading = false;
        this.cdr.detectChanges();
      }

    });
  }


  loadStats(): void {

    this.profileService.getProfileStats().subscribe({

      next: (stats) => {

        this.stats = stats;
        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load profile stats:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          'Unable to load profile statistics.';

        this.loading = false;
        this.cdr.detectChanges();
      }

    });
  }


  startEditingName(): void {

    if (!this.profile) {
      return;
    }

    this.editedName = this.profile.name;
    this.isEditingName = true;
    this.cdr.detectChanges();

  }


  cancelEditingName(): void {

    if (this.profile) {
      this.editedName = this.profile.name;
    }

    this.isEditingName = false;
    this.cdr.detectChanges();

  }


  saveName(): void {

    const name = this.editedName.trim();

    if (!name) {
      return;
    }

    if (
      this.profile &&
      name === this.profile.name
    ) {
      this.isEditingName = false;
      return;
    }

    this.savingName = true;

    this.profileService
      .updateProfile(name)
      .subscribe({

        next: (updatedProfile) => {

          this.profile = updatedProfile;
          this.editedName = updatedProfile.name;

          this.isEditingName = false;
          this.savingName = false;
          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Failed to update name:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to update name.';

          this.savingName = false;

        }

      });

  }


  toggleGeekStat(id: string): void {

    this.expandedGeekStat =
      this.expandedGeekStat === id
        ? null
        : id;

  }


  openSettings(): void {
    this.router.navigate(['/settings']);
  }


  /*
   * Profile image selection
   */
  onProfileImageSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {

      this.errorMessage =
        'Please select an image file.';

      input.value = '';
      this.cdr.detectChanges();
      return;

    }

    /*
     * UploadThing backend limit is 2MB.
     */
    if (file.size > 2 * 1024 * 1024) {

      this.errorMessage = 'Profile picture must be smaller than 2MB.';
      input.value = '';
      this.cdr.detectChanges();
      return;

    }

    this.errorMessage = '';

    this.createCroppedImage(file, input);

  }


  /*
   * Crop the selected image to a centered square.
   *
   * The actual avatar remains circular through CSS.
   * We store the cropped square image, rather than a
   * browser blob URL.
   */
  private createCroppedImage(
    file: File,
    input: HTMLInputElement
  ): void {

    const reader = new FileReader();

    reader.onload = () => {

      const image =
        new Image();

      image.onload = () => {

        const size =
          Math.min(
            image.width,
            image.height
          );

        const sourceX =
          (image.width - size) / 2;

        const sourceY =
          (image.height - size) / 2;

        const canvas =
          document.createElement('canvas');

        canvas.width = 600;
        canvas.height = 600;

        const context =
          canvas.getContext('2d');

        if (!context) {
          this.errorMessage =
            'Unable to process image.';
          input.value = '';
          return;
        }

        context.drawImage(
          image,
          sourceX,
          sourceY,
          size,
          size,
          0,
          0,
          600,
          600
        );

        canvas.toBlob(
          (blob) => {

            if (!blob) {
              this.errorMessage =
                'Unable to process image.';
              input.value = '';
              return;
            }

            const croppedFile =
              new File(
                [blob],
                'profile-picture.jpg',
                {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                }
              );

            this.uploadProfileImage(
              croppedFile,
              input
            );

          },
          'image/jpeg',
          0.9
        );
        this.cdr.detectChanges();
      };

      image.onerror = () => {

        this.errorMessage =
          'Unable to read selected image.';

        input.value = '';

      };

      image.src = reader.result as string;
      this.cdr.detectChanges();

    };

    reader.onerror = () => {

      this.errorMessage =
        'Unable to read selected image.';

      input.value = '';

    };

    reader.readAsDataURL(file);
    this.cdr.detectChanges();

  }


  private uploadProfileImage(
    file: File,
    input: HTMLInputElement
  ): void {

    this.uploadingImage = true;
    this.errorMessage = '';

    const token =
      localStorage.getItem('token');

    if (!token) {

      this.errorMessage =
        'You are not logged in.';

      this.uploadingImage = false;
      input.value = '';

      return;

    }

    this.uploadFiles(
      'profilePicture',
      {
        files: [file],

        headers: {
          Authorization: `Bearer ${token}`
        },

        onUploadProgress: ({ progress }) => {
          console.log(
            `Profile upload: ${progress}%`
          );
        }
      }
    )
    .then((response) => {

      console.log(
        'Upload complete:',
        response
      );

      /*
       * The backend already saves the UploadThing URL
       * into User.profileImage.
       *
       * Reload the profile to get the saved URL.
       */
      this.profileService
        .getProfile()
        .subscribe({

          next: (profile) => {

            this.profile = profile;
            this.uploadingImage = false;

            input.value = '';
            this.cdr.detectChanges();

          },

          error: (error) => {

            console.error(
              'Failed to refresh profile:',
              error
            );

            this.uploadingImage = false;
            input.value = '';

          }

        });

    })
    .catch((error) => {

      console.error(
        'Profile image upload failed:',
        error
      );

      this.errorMessage =
        error?.message ||
        'Profile image upload failed.';

      this.uploadingImage = false;

      input.value = '';

    });

  }


  getProfileImage(): string {

    if (
      this.profile &&
      this.profile.profileImage
    ) {
      return this.profile.profileImage;
    }
    this.cdr.detectChanges();
    return 'assets/images/default-avatar.png';

  }


  get geekStats() {
    return this.stats?.geekStats;
  }


  get summary() {
    return this.stats?.summary;
  }

}