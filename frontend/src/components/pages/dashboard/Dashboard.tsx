import React, { useEffect, useState } from 'react';
import {
  User,
  Link as LinkType,
  LinkFormData,
} from '../../../types';
import { useToast } from '@/hooks/use-toast';
import { API_URL, apiService, AUTH } from '@/services/api';
import UsernameSetup from './UsernameSetup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Menu, Plus, Trash2, Link, LogOut, Edit, UserRound, Share2, Link2, Eye, SlidersHorizontal } from 'lucide-react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LinkForm from '../../LinkForm';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProfileSettings } from './ProfileSettings';
// import { Toaster } from '@/components/ui/toaster';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { SOCIAL_PLATFORMS, SocialLinkForm } from './SocialLinkForm';
import LiveLink from './LiveLink';
// import { platform } from 'os';



export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [usernameSet, setUsernameSet] = useState<boolean>(false);
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = "/";
        return;
      }

      try {
        setIsLoading(true);
        console.log('trrrrrrrrrr')
        const response = await fetch(AUTH, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const userData = await response.json();
        setUser(userData);
        setUsernameSet(!!userData.username);
        const userLinks = await apiService.getUserLinks(userData._id);
        setLinks(userLinks);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    // return () => {
      fetchUserData();
    // }
  }, []);

  const handleAddLink = async (linkData: LinkFormData) => {

    if (!user) return;
    try {
    setIsLoading(true);
      const newLink = await apiService.createLink({
        userId: user._id,
        ...linkData
      });
      setLinks([...links, newLink]);
      toast({
        title: "Success",
        description: "Link added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add link",
        variant: "destructive"
      });
    }finally{
    setIsLoading(false);

    }

    window.location.href ="/dashboard"
  };

  const handleDeleteLink = async (id: number) => {
    setIsLoading(true);

    try {
      await apiService.deleteLink(id);
      setLinks(links.filter(link => link.id !== id));
      toast({
        title: "Success",
        description: "Link deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive"
      });
    }finally{
    setIsLoading(false);

    }

    window.location.href = '/dashboard'
  };

  const handleUpdateLink = async (id: number, linkData: LinkFormData) => {
    try {
      setIsLoading(true)
      const updatedLink = await apiService.updateLink(id, linkData);
      setLinks(links.map(link => link.id === id ? updatedLink : link));
      toast({
        title: "Success",
        description: "Link updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive"
      });
    }finally{
    setIsLoading(false);
    }
    window.location.href ="/dashboard"

  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const newLinks = Array.from(links);
    const [reorderedItem] = newLinks.splice(result.source.index, 1);
    newLinks.splice(result.destination.index, 0, reorderedItem);

    setLinks(newLinks);

    try {
      await apiService.reorderLinks(user!.id, newLinks.map(link => link.id));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder links",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProfile = async (formData: FormData) => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token');
      if (!user?.username) {
        toast({
          title: "Error",
          description: "Username not set, unable to update profile.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`${API_URL}/users/${user.username}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedUser = await response.json();
      setUser(updatedUser);

      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
    finally{
      setIsLoading(false)
    }
    window.location.href ="/dashboard"

  };

  function handleLogout() {
    localStorage.removeItem('token');
    toast({
      title: 'Logged out',
      description: "You have successfully logged out."
    });
    window.location.href = "/";
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>
            Please log in to access your dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!usernameSet) {
    return <UsernameSetup onUsernameSet={(username) => {
      setUser({ ...user, username });
      setUsernameSet(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#f4f0ef]">
      <div className="w-full border-b border-white/[0.08] bg-[#0e0d0d] shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">lost<span className="text-[#ff4056]">.lol</span></h1>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-[#e62940] text-white hover:bg-[#ff3c53]"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-white/[0.08] bg-[#111010] p-3 lg:sticky lg:top-6">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#ff4056]/30 bg-[#241114] font-semibold text-[#ff6878]">
              {user.profilePicture ? <img src={user.profilePicture} alt="" className="h-full w-full object-cover" /> : user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.username}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#81797b]">Workspace</p>
            </div>
          </div>
          <p className="px-2 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[.16em] text-[#746d6e]">Manage page</p>
          <nav aria-label="Dashboard sections" className="grid grid-cols-3 gap-1 sm:grid-cols-5 lg:grid-cols-1">
            <a href="#profile" className="flex min-h-10 items-center gap-2 rounded-lg bg-[#ff3047]/[0.09] px-2 text-[11px] font-semibold text-[#ff7180] sm:px-3 sm:text-xs"><UserRound size={15} />Profile</a>
            <a href="#appearance" className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-[11px] font-medium text-[#aaa2a3] transition-colors hover:bg-white/[0.05] hover:text-white sm:px-3 sm:text-xs"><SlidersHorizontal size={15} />Customize</a>
            <a href="#socials" className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-[11px] font-medium text-[#aaa2a3] transition-colors hover:bg-white/[0.05] hover:text-white sm:px-3 sm:text-xs"><Share2 size={15} />Socials</a>
            <a href="#links" className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-[11px] font-medium text-[#aaa2a3] transition-colors hover:bg-white/[0.05] hover:text-white sm:px-3 sm:text-xs"><Link2 size={15} />Links</a>
            <a href={`/${user.username}`} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-[11px] font-medium text-[#aaa2a3] transition-colors hover:bg-white/[0.05] hover:text-white sm:px-3 sm:text-xs"><Eye size={15} />View</a>
          </nav>
          <div className="mt-4 hidden items-center justify-between border-t border-white/[0.08] px-2 pt-4 text-xs lg:flex">
            <span className="text-[#81797b]">Profile views</span>
            <span className="font-semibold text-[#ff596b]">{user.totalVisit || 0}</span>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#ff596b]">Your page / overview</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Account overview</h2>
            </div>
            <span className="rounded-md border border-white/[0.08] bg-[#111010] px-3 py-2 text-xs text-[#a39b9c]">lost.lol/{user.username}</span>
          </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* Profile Section */}

          <Card id="profile" className="xl:col-span-2 border-white/[0.08] bg-[#111010] text-white">
            <CardHeader className="space-y-1">
            <div className="inline-block rounded-lg border border-white/[0.08] bg-black/30 px-4 py-2 text-center">
  <h3 className="text-sm font-medium text-[#aaa2a3]">Total visits</h3>
  <p className="mt-1 text-lg font-bold text-[#ff596b]">{user.totalVisit}</p>
</div>

              <CardTitle className="text-2xl">Profile</CardTitle>

              <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full border border-[#ff4056]/35 bg-[#241114] flex items-center justify-center text-[#ff6878] text-xl">
                  {user.profilePicture ? (
                           <img
                                src={user.profilePicture}
                                alt={user.username?.[0]?.toUpperCase() || 'User'}
                                className="h-full w-full rounded-full border-2 border-primary object-cover"
                                    />
                            ) : (
                          <span>{user.username?.[0]?.toUpperCase() || 'U'}</span>
                                  )}
                 </div>

                <div>
                  <h3 className="text-2xl font-medium">{user.username}</h3>
                  {/* <Link to={`/${user.username}`}>



                  </Link> */}
                  <LiveLink username={user.username} />

                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProfileSettings
                user={user}
                onUpdateProfile={handleUpdateProfile}
              />
            </CardContent>
          </Card>

          {/* Social Links Section */}
          <Card id="socials" className="border-white/[0.08] bg-[#111010] text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Social Links</CardTitle>
              <p className="text-sm text-gray-500">
                Connect your profiles across platforms
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SOCIAL_PLATFORMS.map((platform) => {
  const existingLink = links.find(link =>
    (link.url?.includes(platform.baseUrl) || false) || // Add null check for url
    (link.title?.toLowerCase() === platform.name.toLowerCase())
  );

  return (
                <Dialog key={platform.id}>
    <DialogTrigger asChild>
      <div
        key={platform.id}
        className="relative group flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-black/30 p-3 text-center transition-all duration-200 hover:border-[#ff4056]/35 hover:bg-white/[0.035]"
      >
        <div className="flex flex-col items-center gap-1.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#ff3047]/[0.09]">
            <platform.icon className="h-5 w-5 text-[#ff6878]" />
          </div>
          <h3 className="text-xs font-semibold text-[#e9e3e4]">{platform.name}</h3>
          <span className={`max-w-full truncate text-[10px] ${existingLink ? 'text-[#ff6878]' : 'text-[#81797b]'}`}>
            {existingLink?.url || 'Add social'}
          </span>
        </div>
      </div>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit {platform.name} Link</DialogTitle>
      </DialogHeader>
      <SocialLinkForm
        platform={platform}
        currentLink={existingLink}
        onSubmit={(linkData) => {
          if (existingLink) {
            handleUpdateLink(existingLink._id, linkData);
          } else {
            handleAddLink(linkData);
          }
        }}
      />
    </DialogContent>
  </Dialog>

  );
})}
              </div>
            </CardContent>
          </Card>



{/* Custom Links Section */}
          <Card id="links" className="border-white/[0.08] bg-[#111010] text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Custom Links</CardTitle>
              <p className="text-sm text-gray-500">
                Add and manage your own personalized links
              </p>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="customLinks">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >

                      {links.map((link, index) => (
                        <Draggable
                          key={link.id}
                          draggableId={link._id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              className="relative flex items-center justify-between rounded-lg border border-white/[0.08] bg-black/30 p-4 transition-all duration-200 hover:border-[#ff4056]/35 hover:bg-white/[0.035]"
                            >
                              <div className="flex items-center space-x-3">
                                <Link className="h-5 w-5 text-[#ff6878]" />
                                <div>
                                  <h3 className="font-medium">{link.title}</h3>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#aaa2a3] hover:text-white truncate block"
                                  >
                                    {link.url}
                                  </a>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Menu className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit custom link</DialogTitle>
                                    </DialogHeader>
                                    <LinkForm
                                      initialData={{ title: link.title, url: link.url }}
                                      onSubmit={(linkData) => handleUpdateLink(link._id, linkData)}
                                    />
                                  </DialogContent>
                                     </Dialog>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteLink(link._id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                  {/* <DropdownMenuItem
                                    onClick={() => {
                                      // Trigger reordering logic if needed
                                    }}
                                  >
                                    <MoveVertical className="mr-2 h-4 w-4" />
                                    Reorder
                                  </DropdownMenuItem> */}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4 w-full flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Custom Link</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Link</DialogTitle>
                  </DialogHeader>
                  <LinkForm
                    onSubmit={(linkData) => handleAddLink(linkData)}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
        </section>
      </div>
    </div>
  );
};
export default Dashboard