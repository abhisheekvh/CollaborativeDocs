
public class Solution
{
    public static int LongestSubstringAtMostTwice(string str)
    {
        if (string.IsNullOrEmpty(str)) return 0;

        int[] counts = new int[128];
        int l = 0;
        int maxLen = 0;

        for (int r = 0; r < str.Length; r++)
        {
            char rightChar = str[r];
            counts[rightChar]++;

            while (counts[rightChar] > 2)
            {
                counts[str[l]] --;
                l++; 
            }

            maxLen = Math.Max(maxLen, r - l + 1);
        }

        return maxLen;
    
}

private static void Main(string[] args)
    {
        string str = "aaabbcccc";
        LongestSubstringAtMostTwice(str);
    }
}