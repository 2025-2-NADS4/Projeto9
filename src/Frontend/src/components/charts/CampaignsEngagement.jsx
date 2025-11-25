// components/charts/CampaignsEngagement.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, MessageCircle, Target } from 'lucide-react';

const CampaignsEngagement = ({ data, isDark }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" />
          Campanhas com Maior Engajamento
        </h2>
        <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Nenhuma campanha com engajamento encontrada
        </p>
      </div>
    );
  }

  // Encontrar valores máximos para normalização
  const maxInteractions = Math.max(...data.map(c => c.interacoes));
  const maxResponseRate = Math.max(...data.map(c => c.taxa_resposta));

  const getBadgeColor = (badge) => {
    const colors = {
      loyalty: 'bg-blue-500',
      timing: 'bg-green-500',
      product: 'bg-purple-500',
      seasonal: 'bg-orange-500',
      reactivation: 'bg-red-500',
      default: 'bg-gray-500'
    };
    return colors[badge] || colors.default;
  };

  const getBadgeIcon = (badge) => {
    const icons = {
      loyalty: <Users size={14} />,
      timing: <Target size={14} />,
      product: <TrendingUp size={14} />,
      seasonal: <MessageCircle size={14} />,
      reactivation: <Users size={14} />
    };
    return icons[badge] || <TrendingUp size={14} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" />
          Campanhas com Maior Engajamento
        </h2>
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {data.length} campanhas
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {data.map((campanha, index) => {
          const interactionWidth = (campanha.interacoes / maxInteractions) * 100;
          const responseWidth = (campanha.taxa_resposta / maxResponseRate) * 100;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${
                campanha.badge === 'loyalty' ? 'border-blue-500' :
                campanha.badge === 'timing' ? 'border-green-500' :
                campanha.badge === 'product' ? 'border-purple-500' :
                campanha.badge === 'seasonal' ? 'border-orange-500' :
                campanha.badge === 'reactivation' ? 'border-red-500' :
                'border-gray-500'
              } ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{campanha.nome}</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(campanha.badge)} text-white`}>
                      {getBadgeIcon(campanha.badge)}
                      {campanha.tipo}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      {campanha.loja}
                    </span>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-blue-500">
                    {campanha.interacoes}
                  </div>
                  <div className="text-sm font-medium text-green-500">
                    {campanha.taxa_resposta}%
                  </div>
                  <div className="text-xs text-gray-500">resposta</div>
                </div>
              </div>

              {/* Barras de progresso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Interações</span>
                  <span>{campanha.interacoes}</span>
                </div>
                <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${interactionWidth}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span>Taxa de Resposta</span>
                  <span>{campanha.taxa_resposta}%</span>
                </div>
                <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${responseWidth}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Resumo no footer */}
      <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-500">
              {data.reduce((sum, c) => sum + c.interacoes, 0)}
            </div>
            <div className="text-xs text-gray-500">Total Interações</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">
              {Math.round(data.reduce((sum, c) => sum + c.taxa_resposta, 0) / data.length)}%
            </div>
            <div className="text-xs text-gray-500">Média Resposta</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-500">
              {data.length}
            </div>
            <div className="text-xs text-gray-500">Campanhas Ativas</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CampaignsEngagement;