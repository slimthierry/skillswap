import React, { useState } from 'react';
import {
  useSkillCategories,
  useSkills,
  useBrowseSkills,
  useAddOfferedSkill,
  useAddWantedSkill,
  useRemoveOfferedSkill,
  useRemoveWantedSkill,
  useCurrentUser,
} from '@skillswap/api-client';
import { SkillCard } from '@skillswap/ui';
import type { ProficiencyLevel } from '@skillswap/types';

export default function SkillsPage() {
  const { data: categories } = useSkillCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { data: skills } = useSkills(selectedCategory || undefined);
  const { data: browseSkills } = useBrowseSkills();
  const { data: user } = useCurrentUser();
  const addOfferedMutation = useAddOfferedSkill();
  const addWantedMutation = useAddWantedSkill();
  const removeOfferedMutation = useRemoveOfferedSkill();
  const removeWantedMutation = useRemoveWantedSkill();

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'offer' | 'want'>('offer');
  const [formSkillId, setFormSkillId] = useState('');
  const [formLevel, setFormLevel] = useState<ProficiencyLevel>('intermediate');
  const [formDescription, setFormDescription] = useState('');
  const [formRate, setFormRate] = useState(1.0);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formType === 'offer') {
      await addOfferedMutation.mutateAsync({
        skill_id: formSkillId,
        proficiency_level: formLevel,
        description: formDescription || undefined,
        hourly_rate_credits: formRate,
      });
    } else {
      await addWantedMutation.mutateAsync({
        skill_id: formSkillId,
        desired_level: formLevel,
        notes: formDescription || undefined,
      });
    }
    setShowForm(false);
    setFormSkillId('');
    setFormDescription('');
    setFormRate(1.0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-content-primary">Competences</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          {showForm ? 'Annuler' : '+ Ajouter une competence'}
        </button>
      </div>

      {/* Add Skill Form */}
      {showForm && (
        <div className="bg-surface-primary rounded-xl border border-edge-primary p-6">
          <h3 className="text-lg font-semibold text-content-primary mb-4">Ajouter une competence</h3>

          {/* Type selector */}
          <div className="inline-flex rounded-lg border border-edge-primary bg-surface-secondary p-1 mb-4">
            <button
              type="button"
              onClick={() => setFormType('offer')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                formType === 'offer' ? 'bg-primary-500 text-white' : 'text-content-secondary hover:bg-surface-tertiary'
              }`}
            >
              Je propose
            </button>
            <button
              type="button"
              onClick={() => setFormType('want')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                formType === 'want' ? 'bg-primary-500 text-white' : 'text-content-secondary hover:bg-surface-tertiary'
              }`}
            >
              Je recherche
            </button>
          </div>

          <form onSubmit={handleAddSkill} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">Categorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Toutes les categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">Competence</label>
              <select
                value={formSkillId}
                onChange={(e) => setFormSkillId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Selectionnez une competence</option>
                {skills?.map((skill) => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">Niveau</label>
              <select
                value={formLevel}
                onChange={(e) => setFormLevel(e.target.value as ProficiencyLevel)}
                className="input-field"
              >
                <option value="beginner">Debutant</option>
                <option value="intermediate">Intermediaire</option>
                <option value="advanced">Avance</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            {formType === 'offer' && (
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1">Tarif (credits/h)</label>
                <input
                  type="number"
                  value={formRate}
                  onChange={(e) => setFormRate(Number(e.target.value))}
                  className="input-field"
                  min="0.25"
                  max="5"
                  step="0.25"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-content-secondary mb-1">
                {formType === 'offer' ? 'Description' : 'Notes'}
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="input-field"
                rows={2}
                placeholder={formType === 'offer' ? 'Decrivez votre experience...' : 'Ce que vous souhaitez apprendre...'}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={addOfferedMutation.isPending || addWantedMutation.isPending}
                className="w-full py-2 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {addOfferedMutation.isPending || addWantedMutation.isPending ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            !selectedCategory ? 'bg-primary-500 text-white' : 'bg-surface-primary text-content-secondary border border-edge-primary hover:bg-surface-secondary'
          }`}
        >
          Tout
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedCategory === cat.id ? 'bg-primary-500 text-white' : 'bg-surface-primary text-content-secondary border border-edge-primary hover:bg-surface-secondary'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* My Skills */}
      {user && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offered Skills */}
          <div className="bg-surface-primary rounded-xl border border-edge-primary p-6">
            <h3 className="text-lg font-semibold text-content-primary mb-4">Mes competences proposees</h3>
            {user.skills_offered && user.skills_offered.length > 0 ? (
              <div className="space-y-3">
                {user.skills_offered.map((offered: any) => (
                  <SkillCard
                    key={offered.id}
                    skill={offered}
                    type="offered"
                    onRemove={() => removeOfferedMutation.mutate(offered.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-content-tertiary">Aucune competence proposee</p>
            )}
          </div>

          {/* Wanted Skills */}
          <div className="bg-surface-primary rounded-xl border border-edge-primary p-6">
            <h3 className="text-lg font-semibold text-content-primary mb-4">Mes competences recherchees</h3>
            {user.skills_wanted && user.skills_wanted.length > 0 ? (
              <div className="space-y-3">
                {user.skills_wanted.map((wanted: any) => (
                  <SkillCard
                    key={wanted.id}
                    skill={wanted}
                    type="wanted"
                    onRemove={() => removeWantedMutation.mutate(wanted.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-content-tertiary">Aucune competence recherchee</p>
            )}
          </div>
        </div>
      )}

      {/* Browse Skills */}
      {browseSkills && browseSkills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-content-primary mb-3">Explorer les competences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {browseSkills.map((entry) => (
              <div key={entry.skill.id} className="bg-surface-primary rounded-xl border border-edge-primary p-4">
                <h4 className="font-medium text-content-primary">{entry.skill.name}</h4>
                <p className="text-sm text-content-tertiary mt-1">{entry.skill.description}</p>
                <div className="flex gap-4 mt-3 text-sm">
                  <span className="text-primary-600 dark:text-primary-400">{entry.offered_count} proposent</span>
                  <span className="text-content-tertiary">{entry.wanted_count} recherchent</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
