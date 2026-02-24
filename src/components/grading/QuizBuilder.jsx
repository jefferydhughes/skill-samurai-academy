import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Trash2,
  Edit,
  GripVertical,
  HelpCircle,
  Code,
  FileText,
  CheckSquare,
  Type,
  MoveUp,
  MoveDown,
} from 'lucide-react';

export default function QuizBuilder({ assignment, onSave, onClose, isSaving }) {
  const [questions, setQuestions] = useState(assignment?.questions || [
    {
      id: 1,
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 5,
      explanation: '',
    },
  ]);

  const [activeQuestion, setActiveQuestion] = useState(null);

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: <HelpCircle className="w-4 h-4" /> },
    { value: 'true_false', label: 'True/False', icon: <CheckSquare className="w-4 h-4" /> },
    { value: 'short_answer', label: 'Short Answer', icon: <Type className="w-4 h-4" /> },
    { value: 'code', label: 'Code', icon: <Code className="w-4 h-4" /> },
    { value: 'essay', label: 'Essay', icon: <FileText className="w-4 h-4" /> },
  ];

  const addQuestion = (type = 'multiple_choice') => {
    const newQuestion = {
      id: Date.now(),
      type,
      question: '',
      ...(type === 'multiple_choice' && {
        options: ['', '', '', ''],
        correctAnswer: 0,
      }),
      ...(type === 'true_false' && {
        correctAnswer: true,
      }),
      points: 5,
      explanation: '',
    };
    setQuestions([...questions, newQuestion]);
    setActiveQuestion(newQuestion.id);
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const deleteQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    if (activeQuestion === questionId) {
      setActiveQuestion(null);
    }
  };

  const moveQuestion = (questionId, direction) => {
    const index = questions.findIndex(q => q.id === questionId);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < questions.length) {
      const newQuestions = [...questions];
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
      setQuestions(newQuestions);
    }
  };

  const addOption = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      updateQuestion(questionId, 'options', [...question.options, '']);
    }
  };

  const removeOption = (questionId, optionIndex) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options.length > 2) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, 'options', newOptions);
      
      // Adjust correct answer if needed
      if (question.correctAnswer >= newOptions.length) {
        updateQuestion(questionId, 'correctAnswer', 0);
      }
    }
  };

  const getTotalPoints = () => {
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  };

  const getQuestionIcon = (type) => {
    const questionType = questionTypes.find(t => t.value === type);
    return questionType?.icon || <HelpCircle className="w-4 h-4" />;
  };

  const handleSubmit = () => {
    onSave({
      ...assignment,
      questions,
      totalPoints: getTotalPoints(),
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Quiz Builder - {assignment?.title}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Questions List */}
          <div className="w-1/3 border-r overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Questions</h3>
                <Badge variant="outline">{getTotalPoints()} points</Badge>
              </div>
              
              <Select
                value=""
                onValueChange={(value) => addQuestion(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add question..." />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 space-y-2">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    activeQuestion === question.id 
                      ? 'bg-indigo-50 border-indigo-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveQuestion(question.id)}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getQuestionIcon(question.type)}
                        <span className="font-medium text-sm">Q{index + 1}</span>
                        <Badge variant="outline" className="text-xs">
                          {question.points} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {question.question || 'New question...'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveQuestion(question.id, 'up');
                      }}
                      disabled={index === 0}
                    >
                      <MoveUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveQuestion(question.id, 'down');
                      }}
                      disabled={index === questions.length - 1}
                    >
                      <MoveDown className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuestion(question.id);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {questions.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No questions added yet</p>
                  <Button 
                    onClick={() => addQuestion('multiple_choice')} 
                    className="mt-4"
                    size="sm"
                  >
                    Add First Question
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Question Editor */}
          <div className="flex-1 overflow-y-auto">
            {activeQuestion && (
              <QuestionEditor
                question={questions.find(q => q.id === activeQuestion)}
                updateQuestion={updateQuestion}
                addOption={addOption}
                removeOption={removeOption}
              />
            )}
            
            {!activeQuestion && questions.length > 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Edit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a question to edit</p>
                </div>
              </div>
            )}
            
            {!activeQuestion && questions.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Add your first question to get started</p>
                  <Button 
                    onClick={() => addQuestion('multiple_choice')} 
                    className="mt-4"
                  >
                    Add Question
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving || questions.length === 0}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : 'Save Quiz'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuestionEditor({ question, updateQuestion, addOption, removeOption }) {
  if (!question) return null;

  const updateField = (field, value) => {
    updateQuestion(question.id, field, value);
  };

  const updateOption = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    updateQuestion(question.id, 'options', newOptions);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Question Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          {(() => {
            const types = {
              multiple_choice: { icon: <HelpCircle className="w-4 h-4" />, label: 'Multiple Choice' },
              true_false: { icon: <CheckSquare className="w-4 h-4" />, label: 'True/False' },
              short_answer: { icon: <Type className="w-4 h-4" />, label: 'Short Answer' },
              code: { icon: <Code className="w-4 h-4" />, label: 'Code' },
              essay: { icon: <FileText className="w-4 h-4" />, label: 'Essay' },
            };
            const type = types[question.type];
            return (
              <>
                {type.icon}
                <span className="font-medium">{type.label}</span>
              </>
            );
          })()}
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Points:</label>
          <Input
            type="number"
            min="1"
            value={question.points}
            onChange={(e) => updateField('points', parseInt(e.target.value) || 1)}
            className="w-20"
          />
        </div>
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium mb-2">Question *</label>
        <Textarea
          value={question.question}
          onChange={(e) => updateField('question', e.target.value)}
          placeholder="Enter your question here..."
          rows={3}
          className="w-full"
        />
      </div>

      {/* Question Type Specific Fields */}
      {question.type === 'multiple_choice' && (
        <div>
          <label className="block text-sm font-medium mb-2">Answer Options *</label>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctAnswer === index}
                  onChange={() => updateField('correctAnswer', index)}
                  className="w-4 h-4"
                />
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                {question.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(question.id, index)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => addOption(question.id)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </div>
        </div>
      )}

      {question.type === 'true_false' && (
        <div>
          <label className="block text-sm font-medium mb-2">Correct Answer *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`tf-${question.id}`}
                checked={question.correctAnswer === true}
                onChange={() => updateField('correctAnswer', true)}
                className="w-4 h-4"
              />
              <span>True</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`tf-${question.id}`}
                checked={question.correctAnswer === false}
                onChange={() => updateField('correctAnswer', false)}
                className="w-4 h-4"
              />
              <span>False</span>
            </label>
          </div>
        </div>
      )}

      {(question.type === 'short_answer' || question.type === 'essay') && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {question.type === 'short_answer' ? 'Sample Answer' : 'Grading Guidelines'}
          </label>
          <Textarea
            value={question.sampleAnswer || ''}
            onChange={(e) => updateField('sampleAnswer', e.target.value)}
            placeholder={
              question.type === 'short_answer' 
                ? 'Provide a sample correct answer...'
                : 'Describe how this should be graded...'
            }
            rows={4}
          />
        </div>
      )}

      {question.type === 'code' && (
        <div>
          <label className="block text-sm font-medium mb-2">Solution Code</label>
          <Textarea
            value={question.solutionCode || ''}
            onChange={(e) => updateField('solutionCode', e.target.value)}
            placeholder="Provide the solution code..."
            rows={6}
            className="font-mono"
          />
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Language</label>
            <Select
              value={question.codeLanguage || 'javascript'}
              onValueChange={(value) => updateField('codeLanguage', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="scratch">Scratch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Explanation (Optional)
        </label>
        <Textarea
          value={question.explanation || ''}
          onChange={(e) => updateField('explanation', e.target.value)}
          placeholder="Explain the correct answer or provide additional context..."
          rows={3}
        />
      </div>
    </div>
  );
}