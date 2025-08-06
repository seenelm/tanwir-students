import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export interface DiscountCode {
  id?: string;
  code: string;
  course: string;
  discount: string;
  used: boolean;
  usedBy?: string;
  usedAt?: Date;
}

export class DiscountCodeService {
  private static instance: DiscountCodeService;
  private db = getFirestore();
  private collectionName = 'codes';

  private constructor() {}

  static getInstance(): DiscountCodeService {
    if (!DiscountCodeService.instance) {
      DiscountCodeService.instance = new DiscountCodeService();
    }
    return DiscountCodeService.instance;
  }

  /**
   * Get all available discount codes
   * @returns Array of all available discount codes
   */
  async getAllAvailableCodes(): Promise<DiscountCode[]> {
    try {
      const codesRef = collection(this.db, this.collectionName);
      const codeQuery = query(codesRef, where("used", "==", false));
      const snapshot = await getDocs(codeQuery);
      
      console.log(`Found ${snapshot.size} available discount codes`);
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DiscountCode));
    } catch (error) {
      console.error('Error getting all available discount codes:', error);
      throw error;
    }
  }

  /**
   * Convert need level to a discount percentage
   * @param need The applicant's need level
   * @returns The appropriate discount percentage
   */
  private getDiscountPercentageFromNeed(need: string | undefined): number {
    // Default to 25% if need is not specified
    if (!need) return 25;
    
    const needLower = need.toLowerCase();
    
    // First, check if the need is already a percentage
    if (needLower.includes('%')) {
      // Extract the numeric part from the percentage string (e.g., "75%" -> 75)
      const percentageMatch = needLower.match(/(\d+)%/);
      if (percentageMatch && percentageMatch[1]) {
        const percentage = parseInt(percentageMatch[1]);
        // Ensure the percentage is one of our valid values
        if (percentage === 25 || percentage === 50 || percentage === 75 || percentage === 100) {
          console.log(`Direct percentage detected: ${percentage}%`);
          return percentage;
        }
      }
    }
    
    // If not a direct percentage, use the text-based mapping
    if (needLower.includes('extreme') || 
        needLower.includes('severe') || 
        needLower.includes('high') || 
        needLower.includes('full')) {
      console.log('High need detected, looking for 100% discount');
      return 100;
    } else if (needLower.includes('significant') ||
               needLower.includes('major') ||
               needLower.includes('substantial')) {
      console.log('Significant need detected, looking for 75% discount');
      return 75;
    } else if (needLower.includes('moderate') || 
               needLower.includes('partial') || 
               needLower.includes('some')) {
      console.log('Moderate need detected, looking for 50% discount');
      return 50;
    } else {
      console.log('Low/standard need detected, looking for 25% discount');
      return 25;
    }
  }

  /**
   * Get an available discount code
   * @param courseName The course name to find a code for (required)
   * @param need Optional need level to determine discount percentage
   * @returns An available discount code or null if none found
   */
  async getAvailableCode(courseName: string, need?: string): Promise<DiscountCode | null> {
    if (!courseName) {
      console.error('Course name is required to find a discount code');
      return null;
    }
    
    try {
      console.log(`Looking for available discount code for course: "${courseName}"`);
      
      // First, get all available codes
      const allCodes = await this.getAllAvailableCodes();
      
      if (allCodes.length === 0) {
        console.log('No available discount codes found at all');
        return null;
      }
      
      console.log(`Found ${allCodes.length} available codes:`, allCodes.map(c => `${c.code} (${c.course}: ${c.discount})`));
      
      // Determine the target discount percentage based on need
      const targetDiscountPercentage = this.getDiscountPercentageFromNeed(need);
      console.log(`Based on need "${need}", targeting discount percentage: ${targetDiscountPercentage}%`);
      
      // Filter codes by course first
      let courseCodes = allCodes.filter(code => {
        const codeCourse = code.course.toLowerCase();
        const searchCourse = courseName.toLowerCase();
        
        // Try exact match first
        if (codeCourse === searchCourse) return true;
        
        // Then try keyword matching
        const courseKeywords: Record<string, string[]> = {
          'associates program': ['associate', 'associates'],
          'prophetic guidance': ['prophetic', 'guidance'],
          'arabic intensive': ['arabic', 'intensive']
        };
        
        for (const [program, keywords] of Object.entries(courseKeywords)) {
          if (codeCourse === program && keywords.some(k => searchCourse.includes(k))) {
            return true;
          }
        }
        
        // Finally try partial matching
        return codeCourse.includes(searchCourse) || searchCourse.includes(codeCourse);
      });
      
      if (courseCodes.length === 0) {
        console.log(`No codes found for course: ${courseName}`);
        return null;
      }
      
      console.log(`Found ${courseCodes.length} codes for course ${courseName}`);
      
      // Parse discount percentages from strings to numbers for comparison
      courseCodes = courseCodes.map(code => {
        const discountStr = code.discount;
        const discountNum = parseInt(discountStr.replace('%', ''));
        return {
          ...code,
          discountNum // Add numeric discount value for sorting
        };
      });
      
      // Sort codes by how close they are to the target percentage
      courseCodes.sort((a, b) => {
        const aDiff = Math.abs((a as any).discountNum - targetDiscountPercentage);
        const bDiff = Math.abs((b as any).discountNum - targetDiscountPercentage);
        return aDiff - bDiff;
      });
      
      // Get the closest match
      const bestMatch = courseCodes[0];
      
      if (bestMatch) {
        console.log(`Selected discount code: ${bestMatch.code} (${bestMatch.discount}) for course: ${bestMatch.course}`);
        return bestMatch;
      }
      
      console.log(`No matching discount code found for course: ${courseName}`);
      return null;
    } catch (error) {
      console.error('Error getting available discount code:', error);
      throw error;
    }
  }

  /**
   * Mark a discount code as used
   * @param codeId The ID of the code to mark as used
   * @param usedBy Email or identifier of who used the code
   * @returns True if successful, false otherwise
   */
  async markCodeAsUsed(codeId: string, usedBy: string): Promise<boolean> {
    try {
      const codeRef = doc(this.db, this.collectionName, codeId);
      
      await updateDoc(codeRef, {
        used: true,
        usedBy,
        usedAt: new Date()
      });
      
      console.log(`Discount code ${codeId} marked as used by ${usedBy}`);
      return true;
    } catch (error) {
      console.error(`Error marking discount code ${codeId} as used:`, error);
      return false;
    }
  }
}
