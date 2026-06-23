import java.util.*;

/**
 * ConnectSphere - Social Network Friend Recommendation System (Java Edition)
 * 
 * This program implements the exact same recommendation engine algorithm
 * used in the web application, built as a standalone Java console application.
 */
public class ConnectSphere {

    // User Model
    public static class User {
        String id;
        String name;
        List<String> skills;
        String city;
        List<String> friends;

        public User(String id, String name, List<String> skills, String city) {
            this.id = id;
            this.name = name;
            this.skills = skills;
            this.city = city;
            this.friends = new ArrayList<>();
        }

        public void addFriend(String friendId) {
            if (!this.friends.contains(friendId)) {
                this.friends.add(friendId);
            }
        }
    }

    // Recommendation Result representation
    public static class Recommendation {
        User user;
        List<String> mutualFriends;
        List<String> commonSkills;
        boolean sameCity;
        int score;

        public Recommendation(User user, List<String> mutualFriends, List<String> commonSkills, boolean sameCity, int score) {
            this.user = user;
            this.mutualFriends = mutualFriends;
            this.commonSkills = commonSkills;
            this.sameCity = sameCity;
            this.score = score;
        }
    }

    private static Map<String, User> database = new HashMap<>();

    public static void main(String[] args) {
        initializeDatabase();
        
        System.out.println("==================================================================");
        System.out.println("      ConnectSphere - Social Network Friend Recommendation Engine ");
        System.out.println("==================================================================");
        System.out.println("Total Registered Users: " + database.size());
        
        // Output Example for Rahul Sharma
        String testUserId = "rahul";
        User selectedUser = database.get(testUserId);
        
        if (selectedUser != null) {
            System.out.println("\nActive Profile Selected: " + selectedUser.name + " (" + selectedUser.city + ")");
            System.out.println("Skills: " + selectedUser.skills);
            System.out.println("Current Friends: " + getFriendNames(selectedUser));
            System.out.println("------------------------------------------------------------------");
            System.out.println("Generating Recommendations...");
            
            List<Recommendation> recommendations = getRecommendations(testUserId);
            
            if (recommendations.isEmpty()) {
                System.out.println("No recommendations found.");
            } else {
                for (Recommendation rec : recommendations) {
                    System.out.println("\n* " + rec.user.name);
                    System.out.println("  Mutual Friends: " + rec.mutualFriends.size() + " (" + String.join(", ", getNamesFromIds(rec.mutualFriends)) + ")");
                    System.out.println("  Common Skills: " + (rec.commonSkills.isEmpty() ? "None" : String.join(", ", rec.commonSkills)));
                    System.out.println("  Same City: " + (rec.sameCity ? "Yes" : "No") + " (" + rec.user.city + ")");
                    System.out.println("  Recommendation Score: " + rec.score);
                }
            }
        }
        System.out.println("==================================================================");
    }

    /**
     * Initializes the social graph profiles and friendships
     */
    private static void initializeDatabase() {
        // Create users
        User rahul = new User("rahul", "Rahul Sharma", Arrays.asList("Java", "Python"), "Hyderabad");
        User priya = new User("priya", "Priya Reddy", Arrays.asList("Python", "AI"), "Hyderabad");
        User arjun = new User("arjun", "Arjun Kumar", Arrays.asList("JavaScript", "Web Development"), "Bangalore");
        User sneha = new User("sneha", "Sneha Patel", Arrays.asList("AI", "Machine Learning", "Python"), "Hyderabad");
        User kiran = new User("kiran", "Kiran Verma", Arrays.asList("Python", "Data Science"), "Chennai");
        User neha = new User("neha", "Neha Singh", Arrays.asList("Java", "Data Science"), "Bangalore");

        // Load into database
        database.put(rahul.id, rahul);
        database.put(priya.id, priya);
        database.put(arjun.id, arjun);
        database.put(sneha.id, sneha);
        database.put(kiran.id, kiran);
        database.put(neha.id, neha);

        // Predefine bidirectional friendships
        addFriendship("rahul", "priya");
        addFriendship("rahul", "arjun");
        addFriendship("rahul", "neha");
        addFriendship("priya", "sneha");
        addFriendship("priya", "kiran");
        addFriendship("arjun", "neha");
        addFriendship("sneha", "kiran");
    }

    private static void addFriendship(String user1Id, String user2Id) {
        User u1 = database.get(user1Id);
        User u2 = database.get(user2Id);
        if (u1 != null && u2 != null) {
            u1.addFriend(user2Id);
            u2.addFriend(user1Id);
        }
    }

    /**
     * Engine Recommendation logic
     * Recommendation Score = (Mutual Friends * 60) + (Common Skills * 20) + (Same City * 20)
     */
    public static List<Recommendation> getRecommendations(String sourceUserId) {
        User source = database.get(sourceUserId);
        List<Recommendation> results = new ArrayList<>();
        if (source == null) return results;

        for (User target : database.values()) {
            // Must not suggest self, and must not suggest existing friends
            if (target.id.equals(source.id) || source.friends.contains(target.id)) {
                continue;
            }

            // 1. Calculate Mutual Friends
            List<String> mutual = new ArrayList<>();
            for (String friendId : source.friends) {
                if (target.friends.contains(friendId)) {
                    mutual.add(friendId);
                }
            }

            // 2. Calculate Common Skills
            List<String> commonSkills = new ArrayList<>();
            for (String skill : source.skills) {
                if (target.skills.contains(skill)) {
                    commonSkills.add(skill);
                }
            }

            // 3. Check City Match
            boolean sameCity = source.city.equalsIgnoreCase(target.city);

            // Compute score components
            int mutualScore = mutual.size() * 60;
            int skillsScore = commonSkills.size() * 20;
            int cityScore = sameCity ? 20 : 0;
            int totalScore = mutualScore + skillsScore + cityScore;

            results.add(new Recommendation(target, mutual, commonSkills, sameCity, totalScore));
        }

        // Sort descending by score
        results.sort((r1, r2) -> Integer.compare(r2.score, r1.score));
        return results;
    }

    // Helper methods for printing
    private static List<String> getFriendNames(User user) {
        List<String> names = new ArrayList<>();
        for (String id : user.friends) {
            User friend = database.get(id);
            if (friend != null) {
                names.add(friend.name);
            }
        }
        return names;
    }

    private static List<String> getNamesFromIds(List<String> ids) {
        List<String> names = new ArrayList<>();
        for (String id : ids) {
            User u = database.get(id);
            if (u != null) {
                names.add(u.name);
            }
        }
        return names;
    }
}
