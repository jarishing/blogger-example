/**
 * Simple Saga Orchestrator - Demonstrates transaction coordination with rollback
 */

export interface SagaStep {
  name: string;
  execute: () => Promise<any>;
  rollback?: () => Promise<void>;
}

export class SimpleSaga {
  private steps: SagaStep[] = [];
  private completedSteps: any[] = [];
  private sagaId: string;

  constructor(sagaId?: string) {
    this.sagaId = sagaId || `saga_${Date.now()}`;
  }

  /**
   * Add a step to the saga
   */
  addStep(step: SagaStep): void {
    this.steps.push(step);
  }

  /**
   * Execute all steps
   */
  async execute(): Promise<any> {
    console.log(`🎭 Starting saga: ${this.sagaId}`);

    try {
      const results: any = {};

      // Execute steps one by one
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];
        console.log(`🔄 Executing step ${i + 1}: ${step.name}`);

        const result = await step.execute();
        this.completedSteps.push({ step, result });
        results[step.name] = result;

        console.log(`✅ Step completed: ${step.name}`);
      }

      console.log(`🎉 Saga completed successfully: ${this.sagaId}`);
      return results;

    } catch (error) {
      console.error(`❌ Saga failed: ${this.sagaId}`, error);
      
      // Execute rollback
      await this.rollback();
      
      throw error;
    }
  }

  /**
   * Rollback completed steps in reverse order
   */
  private async rollback(): Promise<void> {
    console.log(`🔄 Starting rollback for saga: ${this.sagaId}`);

    // Rollback in reverse order
    for (let i = this.completedSteps.length - 1; i >= 0; i--) {
      const { step } = this.completedSteps[i];
      
      if (step.rollback) {
        try {
          console.log(`↩️ Rolling back: ${step.name}`);
          await step.rollback();
          console.log(`✅ Rollback completed: ${step.name}`);
        } catch (error) {
          console.error(`❌ Rollback failed for ${step.name}:`, error);
        }
      }
    }

    console.log(`🔄 Rollback completed for saga: ${this.sagaId}`);
  }
}

/**
 * Example: User Registration Saga
 */
import { AuthServiceClient, UserServiceClient } from './SimpleServiceClient';

export class UserRegistrationSaga extends SimpleSaga {
  private authService = new AuthServiceClient();
  private userService = new UserServiceClient();

  constructor(private userData: any) {
    super();
    this.setupSteps();
  }

  private setupSteps(): void {
    // Step 1: Create user in Auth service
    this.addStep({
      name: 'create_auth_user',
      execute: async () => {
        console.log('Creating user in Auth service...');
        const response = await this.authService.register(this.userData);
        
        if (!response.success) {
          throw new Error(`Auth creation failed: ${response.error}`);
        }
        
        return response.data;
      },
      rollback: async () => {
        console.log('Rolling back auth user creation...');
        // In real implementation, you'd call a rollback endpoint
        console.log('Auth user creation rolled back');
      }
    });

    // Step 2: Create user profile in User service
    this.addStep({
      name: 'create_user_profile',
      execute: async () => {
        console.log('Creating user profile...');
        
        // Get auth user data from previous step
        const authUser = this.completedSteps.find(s => s.step.name === 'create_auth_user')?.result;
        
        const response = await this.userService.updateProfile(authUser.userId, {
          username: this.userData.username,
          bio: this.userData.bio || '',
          image: this.userData.image
        });
        
        if (!response.success) {
          throw new Error(`Profile creation failed: ${response.error}`);
        }
        
        return response.data;
      },
      rollback: async () => {
        console.log('Rolling back user profile creation...');
        // In real implementation, you'd delete or deactivate the profile
        console.log('User profile creation rolled back');
      }
    });

    // Step 3: Send welcome email (simulate)
    this.addStep({
      name: 'send_welcome_email',
      execute: async () => {
        console.log('Sending welcome email...');
        
        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return { emailSent: true, recipient: this.userData.email };
      },
      rollback: async () => {
        console.log('Welcome email rollback (logged for audit)');
      }
    });
  }

  async executeRegistration(): Promise<any> {
    return await this.execute();
  }
}

/**
 * Example: Article Publication Saga
 */
export class ArticlePublicationSaga extends SimpleSaga {
  private articleService = new ArticleServiceClient();
  private userService = new UserServiceClient();

  constructor(private articleData: any, private userId: string) {
    super();
    this.setupSteps();
  }

  private setupSteps(): void {
    // Step 1: Create article
    this.addStep({
      name: 'create_article',
      execute: async () => {
        console.log('Creating article...');
        const response = await this.articleService.createArticle(this.articleData, this.userId);
        
        if (!response.success) {
          throw new Error(`Article creation failed: ${response.error}`);
        }
        
        return response.data;
      },
      rollback: async () => {
        const article = this.completedSteps.find(s => s.step.name === 'create_article')?.result;
        if (article?.id) {
          console.log('Rolling back article creation...');
          await this.articleService.deleteArticle(article.id, this.userId);
          console.log('Article creation rolled back');
        }
      }
    });

    // Step 2: Update author stats
    this.addStep({
      name: 'update_author_stats',
      execute: async () => {
        console.log('Updating author statistics...');
        
        // Simulate stats update
        await new Promise(resolve => setTimeout(resolve, 200));
        
        return { statsUpdated: true };
      },
      rollback: async () => {
        console.log('Rolling back author statistics...');
        // In real implementation, you'd decrement the stats
        console.log('Author statistics rolled back');
      }
    });
  }

  async executePublication(): Promise<any> {
    return await this.execute();
  }
}