import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  Plus,
  X,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles,
  Clock,
  Users
} from 'lucide-react';

const technologies = [
  { value: 'scratch', label: 'Scratch', icon: '🐱' },
  { value: 'voxel', label: 'Voxel', icon: '🎮' },
  { value: 'minecraft', label: 'Minecraft', icon: '⛏️' },
  { value: 'roblox', label: 'Roblox', icon: '🎯' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'web', label: 'Web Dev', icon: '🌐' },
  { value: 'unity', label: 'Unity', icon: '🎲' },
  { value: 'other', label: 'Other', icon: '💻' },
];

const difficulties = ['beginner', 'intro', 'intermediate', 'advanced'];

// Smart defaults based on technology
const technologyDefaults = {
  scratch: { ageMin: 6, ageMax: 10, difficulty: 'beginner' },
  voxel: { ageMin: 8, ageMax: 12, difficulty: 'intro' },
  minecraft: { ageMin: 8, ageMax: 14, difficulty: 'intro' },
  roblox: { ageMin: 10, ageMax: 16, difficulty: 'intermediate' },
  python: { ageMin: 12, ageMax: 18, difficulty: 'intermediate' },
  web: { ageMin: 11, ageMax: 16, difficulty: 'intermediate' },
  unity: { ageMin: 13, ageMax: 18, difficulty: 'advanced' },
  other: { ageMin: 8, ageMax: 14, difficulty: 'intro' },
};

export default function CourseEditor() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const isEditing = !!courseId;

  const [activeTab, setActiveTab] = useState('details');
  const [hasChanges, setHasChanges] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [suggestingMetadata, setSuggestingMetadata] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    heroImage: '',
    description: '',
    fullDescription: '',
    technology: 'scratch',
    difficulty: 'beginner',
    ageRange: { min: 8, max: 12 },
    durationWeeks: 8,
    lessonCount: 8,
    learningOutcomes: [],
    prerequisites: [],
    standards: [],
    tags: [],
    driveResources: {
      folderUrl: '',
      lessonPlans: '',
      worksheets: '',
      assets: ''
    },
    status: 'draft'
  });

  const [newOutcome, setNewOutcome] = useState('');
  const [newTag, setNewTag] = useState('');

  // Fetch existing course if editing
  const { data: existingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.entities.Course.filter({ id: courseId }),
    enabled: !!courseId,
  });

  // Fetch CSTA standards
  const { data: standards = [] } = useQuery({
    queryKey: ['curriculumStandards'],
    queryFn: () => api.entities.CurriculumStandard.list('code'),
  });

  // Fetch badges
  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => api.entities.Badge.list(),
  });

  // Load existing course data
  useEffect(() => {
    if (existingCourse?.[0]) {
      const course = existingCourse[0];
      setFormData({
        name: course.name || '',
        slug: course.slug || '',
        heroImage: course.heroImage || '',
        description: course.description || '',
        fullDescription: course.fullDescription || '',
        technology: course.technology || 'scratch',
        difficulty: course.difficulty || 'beginner',
        ageRange: course.ageRange || { min: 8, max: 12 },
        durationWeeks: course.durationWeeks || 8,
        lessonCount: course.lessonCount || 8,
        learningOutcomes: course.learningOutcomes || [],
        prerequisites: course.prerequisites || [],
        standards: course.standards || [],
        tags: course.tags || [],
        driveResources: course.driveResources || {
          folderUrl: '',
          lessonPlans: '',
          worksheets: '',
          assets: ''
        },
        status: course.status || 'draft'
      });
    }
  }, [existingCourse]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return api.entities.Course.update(courseId, data);
      } else {
        return api.entities.Course.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCourses'] });
      setHasChanges(false);
      if (!isEditing) {
        navigate(createPageUrl('CourseCatalogue'));
      }
    },
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, isEditing]);

  // Apply smart defaults when technology changes
  const handleTechnologyChange = (tech) => {
    const defaults = technologyDefaults[tech];
    setFormData(prev => ({
      ...prev,
      technology: tech,
      difficulty: defaults.difficulty,
      ageRange: { min: defaults.ageMin, max: defaults.ageMax }
    }));
    setHasChanges(true);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      updateField('heroImage', file_url);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const addOutcome = () => {
    if (newOutcome.trim()) {
      updateField('learningOutcomes', [...formData.learningOutcomes, newOutcome.trim()]);
      setNewOutcome('');
    }
  };

  const removeOutcome = (index) => {
    updateField('learningOutcomes', formData.learningOutcomes.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateField('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    updateField('tags', formData.tags.filter(t => t !== tag));
  };

  const toggleStandard = (standard) => {
    const exists = formData.standards.some(s => s.code === standard.code);
    if (exists) {
      updateField('standards', formData.standards.filter(s => s.code !== standard.code));
    } else {
      updateField('standards', [...formData.standards, {
        code: standard.code,
        name: standard.name,
        category: standard.category
      }]);
    }
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handlePublish = () => {
    saveMutation.mutate({ ...formData, status: 'published' });
  };

  const generateLessonContent = async () => {
    if (!formData.name || !formData.technology) {
      alert('Please provide a course name and technology first');
      return;
    }

    setGeneratingContent(true);
    try {
      const response = await api.functions.invoke('invokeLLM', {
        prompt: `Generate detailed lesson content for a ${formData.technology} course titled "${formData.name}".

Course Details:
- Difficulty: ${formData.difficulty}
- Age Range: ${formData.ageRange.min}-${formData.ageRange.max}
- Duration: ${formData.durationWeeks} weeks
- Number of Lessons: ${formData.lessonCount}
${formData.description ? `- Description: ${formData.description}` : ''}

Please provide comprehensive lesson content including:
1. Full course description (2-3 paragraphs)
2. 5-8 learning outcomes (what students will be able to do)
3. 3-5 key prerequisites
4. Example code snippet relevant to this technology
5. 3 quiz questions with answers to assess understanding

Format the response as structured data.`,
        response_json_schema: {
          type: "object",
          properties: {
            fullDescription: { type: "string" },
            learningOutcomes: { type: "array", items: { type: "string" } },
            prerequisites: { type: "array", items: { type: "string" } },
            codeExample: {
              type: "object",
              properties: {
                title: { type: "string" },
                code: { type: "string" },
                explanation: { type: "string" }
              }
            },
            quizQuestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correctAnswer: { type: "string" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Update form with generated content
      setFormData(prev => ({
        ...prev,
        fullDescription: response.fullDescription,
        learningOutcomes: response.learningOutcomes,
        prerequisites: response.prerequisites
      }));

      setHasChanges(true);
      alert('Content generated successfully! Check the Content & Outcomes tab.');
    } catch (error) {
      console.error('Failed to generate content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setGeneratingContent(false);
    }
  };

  const suggestMetadata = async () => {
    if (!formData.fullDescription && !formData.description) {
      alert('Please provide a course description first');
      return;
    }

    setSuggestingMetadata(true);
    try {
      const description = formData.fullDescription || formData.description;
      const response = await api.functions.invoke('invokeLLM', {
        prompt: `Analyze this ${formData.technology} course and suggest appropriate metadata:

Course: "${formData.name}"
Technology: ${formData.technology}
Description: ${description}
Current Learning Outcomes: ${formData.learningOutcomes.join(', ') || 'None'}

Based on the course content, suggest:
1. Appropriate difficulty level (beginner, intro, intermediate, or advanced)
2. 5-8 relevant tags for categorization and search
3. Brief reasoning for the suggestions

Return structured data with your suggestions.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestedDifficulty: { 
              type: "string",
              enum: ["beginner", "intro", "intermediate", "advanced"]
            },
            suggestedTags: { 
              type: "array", 
              items: { type: "string" } 
            },
            reasoning: { type: "string" }
          }
        }
      });

      // Update form with suggestions
      const newTags = response.suggestedTags.filter(tag => !formData.tags.includes(tag));
      
      setFormData(prev => ({
        ...prev,
        difficulty: response.suggestedDifficulty,
        tags: [...prev.tags, ...newTags]
      }));

      setHasChanges(true);
      
      // Show reasoning to user
      alert(`AI Suggestions Applied:\n\nDifficulty: ${response.suggestedDifficulty}\nTags: ${response.suggestedTags.join(', ')}\n\nReasoning: ${response.reasoning}`);
    } catch (error) {
      console.error('Failed to suggest metadata:', error);
      alert('Failed to generate suggestions. Please try again.');
    } finally {
      setSuggestingMetadata(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={createPageUrl('CourseCatalogue')}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? 'Edit Course' : 'Create Course'}
            </h1>
            <p className="text-slate-500 mt-0.5">
              {formData.name || 'New course'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {formData.status === 'draft' && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Draft
            </Badge>
          )}
          {formData.status === 'published' && (
            <Badge className="bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Published
            </Badge>
          )}
          
          <Button 
            variant="outline"
            onClick={suggestMetadata}
            disabled={suggestingMetadata || generatingContent}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {suggestingMetadata ? 'Analyzing...' : 'AI Suggest Tags'}
          </Button>

          <Button 
            variant="outline"
            onClick={generateLessonContent}
            disabled={generatingContent || suggestingMetadata}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generatingContent ? 'Generating...' : 'AI Generate Content'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleSave}
            disabled={saveMutation.isPending || !hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
          </Button>
          
          {formData.status === 'draft' && (
            <Button 
              onClick={handlePublish}
              disabled={saveMutation.isPending || !formData.name}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Main Editor */}
        <div className="col-span-8 overflow-auto">
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="content">Content & Outcomes</TabsTrigger>
                  <TabsTrigger value="standards">Standards</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  {/* Hero Image */}
                  <div className="space-y-2">
                    <Label>Hero Image</Label>
                    <div className="flex items-start gap-4">
                      <div className="w-48 aspect-video rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-200">
                        {formData.heroImage ? (
                          <img src={formData.heroImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">
                            {technologies.find(t => t.value === formData.technology)?.icon || '📚'}
                          </span>
                        )}
                      </div>
                      <div>
                        <label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image
                            </span>
                          </Button>
                        </label>
                        <p className="text-xs text-slate-500 mt-2">
                          Recommended: 16:9 aspect ratio, min 800x450px
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name & Slug */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Course Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="e.g., Scratch Foundations"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => updateField('slug', e.target.value)}
                        placeholder="scratch-foundations"
                      />
                    </div>
                  </div>

                  {/* Technology & Difficulty */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Technology *</Label>
                      <Select value={formData.technology} onValueChange={handleTechnologyChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {technologies.map(tech => (
                            <SelectItem key={tech.value} value={tech.value}>
                              {tech.icon} {tech.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Age & difficulty will auto-suggest based on technology
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty *</Label>
                      <Select 
                        value={formData.difficulty} 
                        onValueChange={(v) => updateField('difficulty', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map(d => (
                            <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Age Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Age</Label>
                      <Input
                        type="number"
                        min={4}
                        max={18}
                        value={formData.ageRange.min}
                        onChange={(e) => updateField('ageRange', {
                          ...formData.ageRange,
                          min: parseInt(e.target.value) || 8
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Age</Label>
                      <Input
                        type="number"
                        min={4}
                        max={18}
                        value={formData.ageRange.max}
                        onChange={(e) => updateField('ageRange', {
                          ...formData.ageRange,
                          max: parseInt(e.target.value) || 12
                        })}
                      />
                    </div>
                  </div>

                  {/* Duration & Lessons */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration (weeks)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.durationWeeks}
                        onChange={(e) => updateField('durationWeeks', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Lessons</Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.lessonCount}
                        onChange={(e) => updateField('lessonCount', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Brief overview shown on course cards..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullDescription">Full Description</Label>
                    <Textarea
                      id="fullDescription"
                      value={formData.fullDescription}
                      onChange={(e) => updateField('fullDescription', e.target.value)}
                      placeholder="Detailed course description..."
                      rows={5}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                  {/* AI Generate Banner */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-violet-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-violet-900">AI Content Generator</h4>
                          <p className="text-sm text-violet-700 mt-1">
                            Let AI generate comprehensive lesson content including descriptions, outcomes, and quiz questions based on your course details.
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateLessonContent}
                        disabled={generatingContent || !formData.name}
                        className="flex-shrink-0 border-violet-300 hover:bg-violet-100"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {generatingContent ? 'Generating...' : 'Generate Now'}
                      </Button>
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="space-y-3">
                    <Label>Learning Outcomes</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={newOutcome}
                        onChange={(e) => setNewOutcome(e.target.value)}
                        placeholder="Add a learning outcome..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                      />
                      <Button type="button" onClick={addOutcome} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.learningOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="flex-1 text-sm">{outcome}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => removeOutcome(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Tags</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={suggestMetadata}
                        disabled={suggestingMetadata || !formData.description}
                        className="text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {suggestingMetadata ? 'Analyzing...' : 'AI Suggest'}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="pr-1">
                          {tag}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-4 w-4 ml-1"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="standards" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">CSTA Standards Alignment</Label>
                      <p className="text-sm text-slate-500 mt-1">
                        Select standards this course addresses
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {formData.standards.length} selected
                    </Badge>
                  </div>
                  
                  <ScrollArea className="h-[400px] border rounded-lg">
                    <div className="p-4 space-y-2">
                      {standards.map(standard => {
                        const isSelected = formData.standards.some(s => s.code === standard.code);
                        return (
                          <div 
                            key={standard.id}
                            onClick={() => toggleStandard(standard)}
                            className={`
                              p-3 rounded-lg border cursor-pointer transition-all
                              ${isSelected 
                                ? 'bg-indigo-50 border-indigo-200' 
                                : 'bg-white border-slate-200 hover:border-indigo-200'
                              }
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`
                                w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                                ${isSelected 
                                  ? 'bg-indigo-600 border-indigo-600' 
                                  : 'border-slate-300'
                                }
                              `}>
                                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-medium">{standard.code}</span>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {standard.gradeLevel}
                                  </Badge>
                                </div>
                                <div className="text-sm font-medium text-slate-900 mt-1">
                                  {standard.name}
                                </div>
                                {standard.description && (
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    {standard.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="resources" className="space-y-6">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Google Drive Integration</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Link to your Google Drive folders containing lesson plans, worksheets, and assets.
                          Teachers will have access based on their platform permissions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="folderUrl">Main Folder URL</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="folderUrl"
                          value={formData.driveResources.folderUrl}
                          onChange={(e) => updateField('driveResources', {
                            ...formData.driveResources,
                            folderUrl: e.target.value
                          })}
                          placeholder="https://drive.google.com/drive/folders/..."
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lessonPlans">Lesson Plans Folder</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="lessonPlans"
                          value={formData.driveResources.lessonPlans}
                          onChange={(e) => updateField('driveResources', {
                            ...formData.driveResources,
                            lessonPlans: e.target.value
                          })}
                          placeholder="https://drive.google.com/drive/folders/..."
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="worksheets">Worksheets Folder</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="worksheets"
                          value={formData.driveResources.worksheets}
                          onChange={(e) => updateField('driveResources', {
                            ...formData.driveResources,
                            worksheets: e.target.value
                          })}
                          placeholder="https://drive.google.com/drive/folders/..."
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assets">Assets Folder</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="assets"
                          value={formData.driveResources.assets}
                          onChange={(e) => updateField('driveResources', {
                            ...formData.driveResources,
                            assets: e.target.value
                          })}
                          placeholder="https://drive.google.com/drive/folders/..."
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Preview */}
        <div className="col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <div className="aspect-video bg-slate-100 flex items-center justify-center">
                  {formData.heroImage ? (
                    <img src={formData.heroImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">
                      {technologies.find(t => t.value === formData.technology)?.icon || '📚'}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900">
                    {formData.name || 'Course Name'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {formData.description || 'Course description will appear here...'}
                  </p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge className="capitalize">
                      {technologies.find(t => t.value === formData.technology)?.icon}{' '}
                      {formData.technology}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {formData.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Ages {formData.ageRange.min}-{formData.ageRange.max}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formData.durationWeeks} weeks
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Course Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Learning Outcomes</span>
                <span className="font-medium">{formData.learningOutcomes.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Standards Aligned</span>
                <span className="font-medium">{formData.standards.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Tags</span>
                <span className="font-medium">{formData.tags.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Drive Resources</span>
                <span className="font-medium">
                  {Object.values(formData.driveResources).filter(Boolean).length} linked
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}