import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Radar, Plus, Upload, Globe, Chrome, Smartphone, Link as LinkIcon } from "lucide-react"

const LovableCapture = () => {
  const platforms = ["reddit", "twitter", "youtube", "instagram", "tiktok", "linkedin"]
  const captureTypes = ["URL", "Text", "Upload", "Extension"]

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                <h1 className="text-xl font-bold text-foreground">Signal Capture</h1>
                <div className="text-sm text-muted-foreground">
                  Capture content for analysis
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Chrome className="w-3 h-3" />
                  Extension Connected
                </Badge>
                <Button variant="outline">
                  <Globe className="w-4 h-4 mr-2" />
                  Browser Extension
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Capture Methods */}
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    URL Capture
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Manual Entry
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="extension" className="flex items-center gap-2">
                    <Chrome className="w-4 h-4" />
                    Extension
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>URL Capture</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="url">Content URL</Label>
                        <Input 
                          id="url"
                          placeholder="https://example.com/article" 
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="platform">Platform</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              {platforms.map((platform) => (
                                <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority Level</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea 
                          id="notes"
                          placeholder="Add any context or notes about this signal..."
                          className="min-h-[100px]"
                        />
                      </div>
                      <Button className="w-full bg-gradient-primary shadow-glow">
                        <Radar className="w-4 h-4 mr-2" />
                        Capture Signal
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="text" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Manual Entry</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input 
                          id="title"
                          placeholder="Signal title" 
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea 
                          id="content"
                          placeholder="Enter the signal content..."
                          className="min-h-[200px]"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="platform">Platform</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              {platforms.map((platform) => (
                                <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="author">Author</Label>
                          <Input 
                            id="author"
                            placeholder="Content author" 
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input 
                          id="tags"
                          placeholder="Add tags separated by commas" 
                          className="w-full"
                        />
                      </div>
                      <Button className="w-full bg-gradient-primary shadow-glow">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Signal
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="upload" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload File</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Upload Content</h3>
                        <p className="text-muted-foreground mb-4">
                          Drag and drop files here, or click to browse
                        </p>
                        <Button variant="outline">
                          Choose Files
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">
                          Supports: Images, PDFs, Text files, Screenshots
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="extension" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Browser Extension</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-8">
                        <Chrome className="w-16 h-16 mx-auto mb-4 text-primary" />
                        <h3 className="text-lg font-semibold mb-2">Extension Active</h3>
                        <p className="text-muted-foreground mb-4">
                          Use the browser extension to capture signals while browsing
                        </p>
                        <div className="space-y-2">
                          <Badge variant="secondary" className="mr-2">
                            Quick Capture: Ctrl+Shift+S
                          </Badge>
                          <Badge variant="secondary">
                            Context Menu: Right-click
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Recent Captures */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Captures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Radar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No recent captures</h3>
                    <p>Start capturing signals to see them here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default LovableCapture