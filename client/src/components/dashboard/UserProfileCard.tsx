import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon } from "lucide-react";

interface UserProfileCardProps {
  user: User;
}

const UserProfileCard = ({ user }: UserProfileCardProps) => {
  // Create initials from first and last name
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 pb-2">
        <CardTitle className="text-lg font-medium text-primary">User Profile</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={user.profilePicture || undefined} alt={user.username} />
            <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;