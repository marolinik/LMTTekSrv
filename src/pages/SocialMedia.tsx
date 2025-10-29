import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Image as ImageIcon, Video } from 'lucide-react';
import { generateSocialText, generateEnhancedImage, generateSocialVideo } from '@/services/geminiService';
import { Loader } from '@/components/ai/Loader';

export default function SocialMedia() {
  const [subject, setSubject] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [posts, setPosts] = useState<Record<string, string>>({});
  const [enhancedImage, setEnhancedImage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState('');
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [videoError, setVideoError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!subject.trim()) return;

    setIsLoadingText(true);
    setError('');
    setPosts({});

    try {
      const result = await generateSocialText(subject);
      setPosts(result.posts);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate social media posts.');
    } finally {
      setIsLoadingText(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!subject.trim() || !image) return;

    setIsLoadingImage(true);
    setImageError('');
    setEnhancedImage('');

    try {
      const imageBase64 = await fileToBase64(image);
      const imageUrl = await generateEnhancedImage(subject, imageBase64, image.type);
      setEnhancedImage(imageUrl);
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || 'Failed to enhance image.');
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!subject.trim() || !image) return;

    setIsLoadingVideo(true);
    setVideoError('');
    setGeneratedVideoUrl(null);
    setVideoStatus('Starting video generation...');

    try {
      const imageBase64 = await fileToBase64(image);
      const videoUrl = await generateSocialVideo(subject, imageBase64, image.type, setVideoStatus);
      setGeneratedVideoUrl(videoUrl);
    } catch (err: any) {
      console.error(err);
      setVideoError(err.message || 'Failed to generate video.');
    } finally {
      setIsLoadingVideo(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Social Media Content</h1>
          <p className="text-muted-foreground"><span className="text-accent">AI-powered</span> multi-platform content generation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Content Details</CardTitle>
                <CardDescription className="text-muted-foreground">Provide subject and image</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., New AI Server Launch"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image</Label>
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 rounded-lg max-h-48 object-cover" />
                  )}
                </div>
                <div className="space-y-3">
                  <Button onClick={handleGenerate} disabled={isLoadingText || !subject.trim()} className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isLoadingText ? 'Generating...' : 'Generate Social Posts'}
                  </Button>

                  <Button
                    onClick={handleGenerateImage}
                    disabled={isLoadingImage || !subject.trim() || !image}
                    className="w-full"
                    variant="outline"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {isLoadingImage ? 'Enhancing Image...' : 'Enhance Image (Optional)'}
                  </Button>

                  <Button
                    onClick={handleGenerateVideo}
                    disabled={isLoadingVideo || !subject.trim() || !image}
                    className="w-full"
                    variant="outline"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    {isLoadingVideo ? 'Generating Video...' : 'Generate Video (Optional)'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Image & video require an uploaded image. Video needs billing-enabled API key.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Generated Content</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[500px]">
                {(isLoadingText || isLoadingImage || isLoadingVideo) && !Object.keys(posts).length && !enhancedImage && !generatedVideoUrl && (
                  <Loader text="Starting generation..." />
                )}
                {error && <p className="text-destructive mb-4">{error}</p>}

                {/* Text Section */}
                {isLoadingText && <Loader text="Generating social media posts..." />}
                {Object.keys(posts).length > 0 && (
                  <div className="space-y-6">
                    {enhancedImage && (
                      <div>
                        <Label className="text-lg font-semibold text-foreground">Enhanced Image</Label>
                        <img src={enhancedImage} alt="Enhanced" className="mt-2 rounded-lg max-w-full shadow-lg" />
                      </div>
                    )}
                    <Tabs defaultValue="linkedin">
                      <TabsList className="w-full">
                        <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                        <TabsTrigger value="x">X (Twitter)</TabsTrigger>
                        <TabsTrigger value="instagram">Instagram</TabsTrigger>
                        <TabsTrigger value="facebook">Facebook</TabsTrigger>
                        <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                      </TabsList>
                      {Object.entries(posts).map(([platform, content]) => (
                        <TabsContent key={platform} value={platform} className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg border border-border">
                            <p className="whitespace-pre-wrap text-foreground">{content}</p>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}

                {/* Image Section */}
                {(isLoadingImage || imageError || enhancedImage) && (
                  <div className="border-t border-border mt-6 pt-6">
                    {isLoadingImage && <Loader text="Enhancing image..." />}
                    {imageError && <p className="text-destructive mb-4">{imageError}</p>}
                    {enhancedImage && !Object.keys(posts).length && (
                      <div>
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <ImageIcon className="h-5 w-5" />
                          Enhanced Image
                        </Label>
                        <img src={enhancedImage} alt="Enhanced" className="mt-2 rounded-lg max-w-full shadow-lg" />
                      </div>
                    )}
                  </div>
                )}

                {/* Video Section */}
                {(isLoadingVideo || videoError || generatedVideoUrl) && (
                  <div className="border-t border-border mt-6 pt-6">
                    {isLoadingVideo && (
                      <div className="space-y-4">
                        <Loader text={videoStatus} />
                        <p className="text-sm text-muted-foreground text-center">
                          Video generation can take several minutes. Please be patient...
                        </p>
                      </div>
                    )}
                    {videoError && <p className="text-destructive">{videoError}</p>}
                    {generatedVideoUrl && (
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Video className="h-5 w-5" />
                          Generated Video
                        </Label>
                        <video controls src={generatedVideoUrl} className="w-full rounded-lg shadow-lg" />
                        <a
                          href={generatedVideoUrl}
                          download={`social_video_${Date.now()}.mp4`}
                          className="inline-flex items-center gap-2 bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition"
                        >
                          <Video className="h-4 w-4" />
                          Download Video
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {!isLoadingText && !isLoadingImage && !isLoadingVideo && Object.keys(posts).length === 0 && !error && (
                  <p className="text-muted-foreground text-center py-12">
                    Provide a subject to generate social media posts
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
